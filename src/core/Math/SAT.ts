import Pool from "../engine/Pool";
import {
    Circle,
    mat3create,
    mat3reset,
    obj2transform,
    vec2copy,
    vec2dot,
    vec2len,
    vec2len2,
    vec2norm,
    vec2prep,
    vec2reverse,
    vec2scale,
    vec2sub,
    Vector,
    ZERO
} from "./Math2D";

export class Polygon {

    points: number[];
    calcPoints: Vector[];
    edges: Vector[];
    normals: Vector[];

    protected transform = mat3create();

    constructor(points: number[] = [], transform?: Float32Array) {
        this.setPoints(points, transform);
    }

    protected compute() {
        const points = this.points;
        const calcPoints = this.calcPoints;
        for (let i = 0; i < points.length; i += 2) {
            const vec = calcPoints[i / 2];
            vec.x = points[i];
            vec.y = points[i + 1];
            obj2transform(vec, this.transform);
        }
        const len = calcPoints.length;
        for (let i = 0; i < len; i++) {
            const p1 = calcPoints[i];
            const p2 = i < len - 1 ? calcPoints[i + 1] : calcPoints[0];
            const e = vec2sub(vec2copy(this.edges[i], p2), p1);
            vec2norm(vec2prep(vec2copy(this.normals[i], e)));
        }
    }

    setPoints(points: number[], transform?: Float32Array) {
        mat3reset(this.transform, transform);
        if (points.length < 6) {
            const [x, y, w, h] = points;
            points = [x, y, x + w, y, x + w, y + h, x, y + h];
        }
        const lengthChanged = !this.points || this.points.length !== points.length;
        if (lengthChanged) {
            let i;
            const calcPoints: Vector[] = this.calcPoints = [];
            const edges: Vector[] = this.edges = [];
            const normals: Vector[] = this.normals = [];
            for (i = 0; i < points.length; i += 2) {
                calcPoints.push({...ZERO});
                edges.push({...ZERO});
                normals.push({...ZERO});
            }
        }
        this.points = points;
        this.compute();
    }

    clone(): Polygon {
        return new Polygon([...this.points], new Float32Array(this.transform));
    }

}

export class Response {

    aInB: boolean;
    bInA: boolean;
    overlap: number;

    constructor(
        public overlapN: Vector = {...ZERO},
        public overlapV: Vector = {...ZERO}
    ) {
        this.clear();
    }

    clear(): Response {
        this.aInB = true;
        this.bInA = true;
        this.overlap = Number.MAX_VALUE;
        return this;
    }

}

const T_RESPONSE = new Response();
const T_ARRAYS = new Pool<number[]>(() => []);
const T_VECTORS = new Pool<Vector>(() => ({...ZERO}));
const TEST_POINT: Circle = {x: 0, y: 0, r: 0.000001};
const LEFT_VORONOI_REGION = -1;
const MIDDLE_VORONOI_REGION = 0;
const RIGHT_VORONOI_REGION = 1;

function voronoiRegion(line: Vector, point: Vector) {
    const len2 = vec2len2(line);
    const dp = vec2dot(point, line);
    // If the point is beyond the start of the line, it is in the
    // left voronoi region.
    if (dp < 0) {
        return LEFT_VORONOI_REGION;
    }
        // If the point is beyond the end of the line, it is in the
    // right voronoi region.
    else if (dp > len2) {
        return RIGHT_VORONOI_REGION;
    }
    // Otherwise, it's in the middle one.
    else {
        return MIDDLE_VORONOI_REGION;
    }
}

function flattenPointsOn(points: Vector[], normal: Vector, result: number[]) {
    let min = Number.MAX_VALUE;
    let max = -Number.MAX_VALUE;
    for (const point of points) {
        const dot = vec2dot(point, normal);
        if (dot < min) {
            min = dot;
        }
        if (dot > max) {
            max = dot;
        }
    }
    result[0] = min;
    result[1] = max;
}

export function isSeparatingAxis(aPoints: Vector[], bPoints: Vector[], axis: Vector, response: Response): boolean {
    const rangeA = T_ARRAYS.get();
    const rangeB = T_ARRAYS.get();
    // Project the polygons onto the axis.
    flattenPointsOn(aPoints, axis, rangeA);
    flattenPointsOn(bPoints, axis, rangeB);
    // Check if there is a gap. If there is, this is a separating axis and we can stop
    if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
        T_ARRAYS.put(rangeA);
        T_ARRAYS.put(rangeB);
        return true;
    }
    // This is not a separating axis. If we're calculating a response, calculate the overlap.
    if (response) {
        let overlap;
        // A starts further left than B
        if (rangeA[0] < rangeB[0]) {
            response.aInB = false;
            // A ends before B does. We have to pull A out of B
            if (rangeA[1] < rangeB[1]) {
                overlap = rangeA[1] - rangeB[0];
                response.bInA = false;
                // B is fully inside A.  Pick the shortest way out.
            } else {
                const option1 = rangeA[1] - rangeB[0];
                const option2 = rangeB[1] - rangeA[0];
                overlap = option1 < option2 ? option1 : -option2;
            }
            // B starts further left than A
        } else {
            response.bInA = false;
            // B ends before A ends. We have to push A out of B
            if (rangeA[1] > rangeB[1]) {
                overlap = rangeA[0] - rangeB[1];
                response.aInB = false;
                // A is fully inside B.  Pick the shortest way out.
            } else {
                const option1 = rangeA[1] - rangeB[0];
                const option2 = rangeB[1] - rangeA[0];
                overlap = option1 < option2 ? option1 : -option2;
            }
        }
        // If this is the smallest amount of overlap we've seen so far, set it as the minimum overlap.
        const absOverlap = Math.abs(overlap);
        if (absOverlap < response.overlap) {
            response.overlap = absOverlap;
            vec2copy(response.overlapN, axis);
            if (overlap < 0) {
                vec2reverse(response.overlapN);
            }
        }
    }
    T_ARRAYS.put(rangeA);
    T_ARRAYS.put(rangeB);
    return false;
}

export function pointInCircle(p: Vector, c: Circle): boolean {
    const differenceV = vec2sub(vec2copy(T_VECTORS.get(), p), c);
    const radiusSq = c.r * c.r;
    const distanceSq = vec2len2(differenceV);
    T_VECTORS.put(differenceV);
    // If the distance between is smaller than the radius then the point is inside the circle.
    return distanceSq <= radiusSq;
}

export function pointInPolygon(p: Vector, poly: Polygon): boolean {
    vec2copy(TEST_POINT, p);
    T_RESPONSE.clear();
    let result = testCirclePolygon(TEST_POINT, poly, T_RESPONSE);
    if (result) {
        result = T_RESPONSE.aInB;
    }
    return result;
}

export function testPolygonPolygon(a: Polygon, b: Polygon, response: Response): boolean {
    const aPoints = a.calcPoints;
    const bPoints = b.calcPoints;
    // If any of the edge normals of A is a separating axis, no intersection.
    for (let i = 0; i < aPoints.length; i++) {
        if (isSeparatingAxis(aPoints, bPoints, a.normals[i], response)) {
            return false;
        }
    }
    // If any of the edge normals of B is a separating axis, no intersection.
    for (let i = 0; i < bPoints.length; i++) {
        if (isSeparatingAxis(aPoints, bPoints, b.normals[i], response)) {
            return false;
        }
    }
    // Since none of the edge normals of A or B are a separating axis, there is an intersection
    // and we've already calculated the smallest overlap (in isSeparatingAxis).  Calculate the
    // final overlap vector.
    if (response) {
        vec2scale(vec2copy(response.overlapV, response.overlapN), response.overlap);
    }
    return true;
    0
}

export function testCircleCircle(a: Circle, b: Circle, response: Response): boolean {
    // Check if the distance between the centers of the two
    // circles is greater than their combined radius.
    const differenceV = vec2sub(vec2copy(T_VECTORS.get(), b), a);
    const totalRadius = a.r + b.r;
    const totalRadiusSq = totalRadius * totalRadius;
    const distanceSq = vec2len2(differenceV);
    // If the distance is bigger than the combined radius, they don't intersect.
    if (distanceSq > totalRadiusSq) {
        T_VECTORS.put(differenceV);
        return false;
    }
    // They intersect.  If we're calculating a response, calculate the overlap.
    if (response) {
        const dist = Math.sqrt(distanceSq);
        response.overlap = totalRadius - dist;
        vec2copy(response.overlapN, vec2norm(differenceV));
        vec2scale(vec2copy(response.overlapV, differenceV), response.overlap);
        response.aInB = a.r <= b.r && dist <= b.r - a.r;
        response.bInA = b.r <= a.r && dist <= a.r - b.r;
    }
    T_VECTORS.put(differenceV);
    return true;
}

export function testPolygonCircle(polygon: Polygon, circle: Circle, response: Response): boolean {
    // Get the position of the circle relative to the polygon.
    const circlePos = vec2copy(T_VECTORS.get(), circle);
    const radius = circle.r;
    const radius2 = radius * radius;
    const points = polygon.calcPoints;
    const len = points.length;
    const edge = T_VECTORS.get();
    const point = T_VECTORS.get();

    // For each edge in the polygon:
    for (let i = 0; i < len; i++) {
        const next = i === len - 1 ? 0 : i + 1;
        const prev = i === 0 ? len - 1 : i - 1;
        let overlap = 0;
        let overlapN = null;

        // Get the edge.
        vec2copy(edge, polygon.edges[i]);
        // Calculate the center of the circle relative to the starting point of the edge.
        vec2sub(vec2copy(point, circlePos), points[i]);

        // If the distance between the center of the circle and the point
        // is bigger than the radius, the polygon is definitely not fully in
        // the circle.
        if (response && vec2len2(point) > radius2) {
            response.aInB = false;
        }

        // Calculate which Voronoi region the center of the circle is in.
        const region = voronoiRegion(edge, point);
        // If it's the left region:
        if (region === LEFT_VORONOI_REGION) {
            // We need to make sure we're in the RIGHT_VORONOI_REGION of the previous edge.
            vec2copy(edge, polygon.edges[prev]);
            // Calculate the center of the circle relative the starting point of the previous edge
            const point2 = vec2sub(vec2copy(T_VECTORS.get(), circlePos), points[prev]);
            if (voronoiRegion(edge, point2) === RIGHT_VORONOI_REGION) {
                // It's in the region we want.  Check if the circle intersects the point.
                const dist = vec2len(point);
                if (dist > radius) {
                    // No intersection
                    T_VECTORS.put(circlePos);
                    T_VECTORS.put(edge);
                    T_VECTORS.put(point);
                    T_VECTORS.put(point2);
                    return false;
                } else if (response) {
                    // It intersects, calculate the overlap.
                    response.bInA = false;
                    overlapN = vec2norm(point);
                    overlap = radius - dist;
                }
            }
            T_VECTORS.put(point2);
            // If it's the right region:
        } else if (region === RIGHT_VORONOI_REGION) {
            // We need to make sure we're in the left region on the next edge
            vec2copy(edge, polygon.edges[next]);
            // Calculate the center of the circle relative to the starting point of the next edge.
            vec2sub(vec2copy(point, circlePos), points[next]);
            if (voronoiRegion(edge, point) === LEFT_VORONOI_REGION) {
                // It's in the region we want.  Check if the circle intersects the point.
                const dist = vec2len(point);
                if (dist > radius) {
                    // No intersection
                    T_VECTORS.put(circlePos);
                    T_VECTORS.put(edge);
                    T_VECTORS.put(point);
                    return false;
                } else if (response) {
                    // It intersects, calculate the overlap.
                    response.bInA = false;
                    overlapN = vec2norm(point);
                    overlap = radius - dist;
                }
            }
            // Otherwise, it's the middle region:
        } else {
            // Need to check if the circle is intersecting the edge,
            // Change the edge into its "edge normal".
            const normal = vec2norm(vec2prep(edge));
            // Find the perpendicular distance between the center of the
            // circle and the edge.
            const dist = vec2dot(point, normal);
            const distAbs = Math.abs(dist);
            // If the circle is on the outside of the edge, there is no intersection.
            if (dist > 0 && distAbs > radius) {
                // No intersection
                T_VECTORS.put(circlePos);
                T_VECTORS.put(normal);
                T_VECTORS.put(point);
                return false;
            } else if (response) {
                // It intersects, calculate the overlap.
                overlapN = normal;
                overlap = radius - dist;
                // If the center of the circle is on the outside of the edge, or part of the
                // circle is on the outside, the circle is not fully inside the polygon.
                if (dist >= 0 || overlap < 2 * radius) {
                    response.bInA = false;
                }
            }
        }

        // If this is the smallest overlap we've seen, keep it.
        // (overlapN may be null if the circle was in the wrong Voronoi region).
        if (overlapN && response && Math.abs(overlap) < Math.abs(response.overlap)) {
            response.overlap = overlap;
            vec2copy(response.overlapN, overlapN);
        }
    }

    // Calculate the final overlap vector - based on the smallest overlap.
    if (response) {
        vec2scale(vec2copy(response.overlapV, response.overlapN), response.overlap);
    }
    T_VECTORS.put(circlePos);
    T_VECTORS.put(edge);
    T_VECTORS.put(point);
    return true;
}

export function testCirclePolygon(circle: Circle, polygon: Polygon, response: Response): boolean {
    // Test the polygon against the circle.
    const result = testPolygonCircle(polygon, circle, response);
    if (result && response) {
        // Swap A and B in the response.
        const aInB = response.aInB;
        vec2reverse(response.overlapN);
        vec2reverse(response.overlapV);
        response.aInB = response.bInA;
        response.bInA = aInB;
    }
    return result;
}
