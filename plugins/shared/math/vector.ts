import { FixedLengthArray } from "../types/fixed_length_array";
import { Add } from "../types/type_arithmetic";
import { Matrix } from "./matrix";

export class Vector<N extends number> {
    private readonly values: FixedLengthArray<number, N>;
    public readonly size: N;

    constructor(...values: FixedLengthArray<number, N>) {
        this.values = values;
        this.size = values.length;
    }

    //#region default operators
    get x() {
        return this.get(0);
    }

    set x(v: number) {
        this.set(0, v);
    }

    get y() {
        return this.get(1);
    }

    set y(v: number) {
        this.set(1, v);
    }

    get z() {
        return this.get(2);
    }

    set z(v: number) {
        this.set(2, v);
    }

    get w() {
        return this.get(3);
    }

    set w(v: number) {
        this.set(3, v);
    }
    //#endregion

    clone(): Vector<N> {
        //@ts-ignore
        return new Vector(...this.values);
    }

    get(index: number): number {
        return this.values[index];
    }

    set(index: number, value: number) {
        this.values[index] = value;
        return this;
    }

    setFromVector(other: Vector<N>) {
        //@ts-ignore
        this.values = other.values.slice();
    }

    // Adds this vector with another one of the same size:
    add(other: Vector<N>): Vector<N> {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] += other.values[i];
        }

        return this;
    }

    // Subtracts another vector from this one:
    sub(other: Vector<N>): Vector<N> {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] -= other.values[i];
        }
        return this;
    }

    // Multiplies this vector with another one of the same size:
    mult(other: Vector<N>): Vector<N> {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] *= other.values[i];
        }

        return this;
    }

    // Multiplies this vector by a scalar:
    multScalar(scalar: number): Vector<N> {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] *= scalar;
        }

        return this;
    }

    // Applies a matrix to this vector:
    applyMatrix(matrix: Matrix<N, N>) {
        for (let i = 0; i < this.values.length; i++) {
            let sum = 0;

            for (let j = 0; j < this.values.length; j++) {
                sum += matrix.get(j, i) * this.values[j];
            }

            this.values[i] = sum;
        }

        return this;
    }

    // Applies an affine matrix to this vector:
    applyAffineMatrix(matrix: Matrix<Add<1, N>, Add<1, N>>) {
        this.applyMatrix(matrix as Matrix<N, N>);
        this.values.splice(this.values.length - 1, 1);
        return this;
    }

    // Returns the dot product of this vector with another one of the same size:
    dot(other: Vector<N>): number {
        let sum = 0;

        for (let i = 0; i < this.values.length; i++) {
            sum += this.values[i] * other.values[i];
        }

        return sum;
    }

    // Returns the cross product of this vector with another one of the same size:
    cross(other: Vector<N>): Vector<N> {
        //@ts-ignore
        const result = new Vector<N>(...this.values);

        for (let i = 0; i < this.values.length; i++) {
            result.values[i] =
                this.values[(i + 1) % this.values.length] *
                    other.values[(i + 2) % this.values.length] -
                this.values[(i + 2) % this.values.length] *
                    other.values[(i + 1) % this.values.length];
        }

        return result;
    }

    // Returns the squared length of this vector:
    lengthSquared(): number {
        let sum = 0;

        for (let i = 0; i < this.values.length; i++) {
            sum += this.values[i] ** 2;
        }

        return sum;
    }

    // Returns the length of this vector:
    length(): number {
        return Math.sqrt(this.lengthSquared());
    }

    // Normalizes this vector:
    normalize(): Vector<N> {
        return this.multScalar(1 / this.length());
    }
}
