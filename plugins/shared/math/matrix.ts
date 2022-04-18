import {
    FixedLength2dArray,
    FixedLengthArray,
} from "../types/fixed_length_array";
import { Add, Subtract } from "../types/type_arithmetic";
import { Vector } from "./vector";

export class Matrix<W extends number, H extends number> {
    private internalArray: number[][];
    public width: W;
    public height: H;

    constructor(arr: FixedLength2dArray<W, H, number>) {
        this.width = arr[0].length;
        this.height = arr.length;
        this.internalArray = arr as number[][];
    }

    // QOL methods
    getPos(this: Matrix<3, 3>) {
        if (this.get(1, 0) === 0 && this.get(0, 1) === 0) {
            return new Vector(this.get(2, 0), this.get(2, 1));
        } else {
            return new Vector(0, 0).applyAffineMatrix(this);
        }
    }

    setPos(this: Matrix<3, 3>, pos: Vector<2>) {
        this.set(2, 0, pos.get(0));
        this.set(2, 1, pos.get(1));
        return this;
    }

    asArray() {
        return this.internalArray as FixedLength2dArray<W, H, number>;
    }

    toDom2dMatrix(this: Matrix<3, 3>): DOMMatrix {
        return new DOMMatrix([
            this.get(0, 0),
            this.get(1, 0),
            this.get(0, 1),
            this.get(1, 1),
            this.get(2, 0),
            this.get(2, 1),
        ]);
    }

    mult(matrix: Matrix<W, H>) {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < matrix.width; j++) {
                let sum = 0;
                for (let k = 0; k < this.width; k++) {
                    sum += this.get(k, i) * matrix.get(j, k);
                }
                this.set(j, i, sum);
            }
        }
    }

    clone() {
        return new Matrix(
            this.internalArray.map((row) => row.slice()) as FixedLength2dArray<
                W,
                H,
                number
            >
        );
    }

    get(x: number, y: number) {
        return this.internalArray[y][x];
    }

    set(x: number, y: number, value: number) {
        this.internalArray[y][x] = value;
    }

    add(x: number, y: number, amount: number) {
        this.internalArray[y][x] += amount;
    }

    setFromMatrix(matrix: Matrix<W, H>) {
        this.internalArray = matrix.internalArray.map((row) => row.slice());
    }

    translate(vector: Vector<Subtract<H, 1>>) {
        for (let i = 0; i < vector.size; i++) {
            this.add(this.width - 1, i, vector.get(i));
        }
        return this;
    }

    rotate(this: Matrix<3, 3>, angle: number) {
        this.mult(Matrix.rotationMatrix(angle, 3));
        return this;
    }

    static identity<M extends number>(size: M) {
        const arr = [] as unknown as FixedLength2dArray<M, M, number>;

        for (let i = 0; i < size; i++) {
            arr[i] = [] as unknown as FixedLengthArray<number, M>;
            for (let j = 0; j < size; j++) {
                arr[i][j] = i === j ? 1 : 0;
            }
        }

        return new Matrix(arr);
    }

    static mult<M extends number, N extends number, P extends number>(
        first: Matrix<N, M>,
        second: Matrix<P, N>
    ) {
        const newArr = [] as unknown as FixedLength2dArray<P, M, number>;

        for (let i = 0; i < first.height; i++) {
            newArr[i] = [] as unknown as FixedLengthArray<number, P>;
            for (let j = 0; j < second.width; j++) {
                let sum = 0;
                for (let k = 0; k < first.width; k++) {
                    sum += first.get(k, i) * second.get(j, k);
                }
                newArr[i][j] = sum;
            }
        }

        return new Matrix(newArr);
    }

    static translationMatrix<T extends number, M extends Add<T, 1>>(
        translation: Vector<T>
    ) {
        const matrix = Matrix.identity<M>((translation.size + 1) as M);

        for (let i = 0; i < translation.size; i++) {
            matrix.set(translation.size + 1, i, translation.get(i));
        }

        return matrix;
    }

    static rotationMatrix<T extends number = 3>(angle: number, size: T) {
        const matrix = Matrix.identity<T>(size);

        matrix.set(0, 0, Math.cos(angle));
        matrix.set(0, 1, -Math.sin(angle));
        matrix.set(1, 0, Math.sin(angle));
        matrix.set(1, 1, Math.cos(angle));

        return matrix;
    }
}

new Matrix([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]);
