import {
    FixedLength2dArray,
    FixedLengthArray,
} from "../types/fixed_length_array";
import { Add, Subtract } from "../types/type_arithmetic";
import { Vector } from "./vector";

export class Matrix<Rows extends number, Cols extends number> {
    private readonly values: Float64Array;

    constructor(public readonly rows: Rows, public readonly cols: Cols) {
        this.values = new Float64Array(rows * cols).fill(0);
    }

    get(row: number, col: number): number {
        return this.values[row * this.cols + col];
    }

    set(row: number, col: number, val: number): void {
        this.values[row * this.cols + col] = val;
    }

    setRow(row: number, values: number[]): void {
        for (let i = 0; i < this.cols; i++) {
            this.values[row * this.cols + i] = values[i];
        }
    }

    setCol(col: number, values: number[]): void {
        for (let i = 0; i < this.rows; i++) {
            this.values[i * this.cols + col] = values[i];
        }
    }

    clone(): Matrix<Rows, Cols> {
        const result = new Matrix<Rows, Cols>(this.rows, this.cols);
        for (let i = 0; i < this.rows * this.cols; i++) {
            result.values[i] = this.values[i];
        }
        return result;
    }

    add(other: Matrix<Rows, Cols>): Matrix<Rows, Cols> {
        const result = new Matrix<Rows, Cols>(this.rows, this.cols);
        for (let i = 0; i < this.rows * this.cols; i++) {
            result.values[i] = this.values[i] + other.values[i];
        }
        return result;
    }

    // Matrix multiplication
    mult<OtherCols extends number>(other: Matrix<Cols, OtherCols>): Matrix<Rows, OtherCols> {
        if (this.cols !== other.rows) {
            throw new Error("Matrix dimensions do not match");
        }

        const result = new Matrix(this.rows, other.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < other.cols; j++) {
                let sum = 0;
                for (let k = 0; k < this.cols; k++) {
                    sum += this.values[i * this.cols + k] * other.values[k * other.cols + j];
                }
                result.values[i * other.cols + j] = sum;
            }
        }
        return result;
    }

    // Matrix multiplication with a vector
    multVector(vector: Vector<Cols>): Vector<Rows> {
        if (this.cols !== vector.length) {
            throw new Error("Matrix dimensions do not match");
        }
        
    }

    static identity(size: number): Matrix<number, number> {
        const matrix = new Matrix(size, size);
        for (let i = 0; i < size; i++) {
            matrix.values[i * size + i] = 1;
        }
        return matrix;
    }
}
