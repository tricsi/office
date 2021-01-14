export type SoundParam = [
    /** Oscillator type */
    OscillatorType | number[],
    /** Length */
    number,
    /** Oscillator curve */
    number | number[],
    /** Noise curve */
    number | number[]
];

export function waveFactory(factory: (n: number) => number): number[] {
    return Array.from({ length: 8191 }, (_, n) => factory(n + 1));
}

export const WAVE_SAW = "sawtooth";
export const WAVE_SINE = "sine";
export const WAVE_SQUARE = "square";
export const WAVE_TRIANGLE = "triangle";
export const WAVE_BASS = [1, .81, .21, .021];
export const WAVE_BRASS = [.4, .4, 1, 1, 1, .3, .7, .6, .5, .9, .8];
export const WAVE_ORGAN = [1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1];
export const WAVE_CHIPTUNE = waveFactory((n) => 4 / (n * Math.PI) * Math.sin(Math.PI * n * 0.18))

export default class Sound {

    static noise: AudioBuffer;

    protected filter: BiquadFilterNode;
    protected src: AudioBufferSourceNode;
    protected srcVol: GainNode;
    protected osc: OscillatorNode;
    protected oscVol: GainNode;

    constructor(public param: SoundParam, protected ctx: OfflineAudioContext) {
        this.srcVol = ctx.createGain();
        this.srcVol.connect(ctx.destination);

        this.filter = ctx.createBiquadFilter();
        this.filter.connect(this.srcVol);

        const src = this.ctx.createBufferSource();
        src.buffer = Sound.noise;
        src.loop = true;
        src.connect(this.filter);
        this.src = src;

        this.oscVol = ctx.createGain();
        this.oscVol.connect(ctx.destination);

        this.osc = this.ctx.createOscillator();
        if (typeof param[0] === "string") {
            this.osc.type = param[0];
        } else {
            const real = [0, ...param[0]];
            this.osc.setPeriodicWave(ctx.createPeriodicWave(real, real.map(() => 0)));
        }
        this.osc.connect(this.oscVol);
    }

    protected set(param: AudioParam, value: number | number[], length: number, offset: number) {
        value instanceof Array
            ? param.setValueCurveAtTime(Float32Array.from(value), offset, length - 0.01)
            : param.setValueAtTime(value, offset);
    }

    render(freq: number | number[], length: number = this.param[1], offset: number = 0) {
        this.set(this.osc.frequency, freq, length, offset);
        this.set(this.filter.detune, freq, length, offset);
        this.set(this.oscVol.gain, freq ? this.param[2] || 0 : 0, length, offset);
        this.set(this.srcVol.gain, freq ? this.param[3] || 0 : 0, length, offset);
    }

    start(time: number = this.param[1]) {
        this.src.start();
        this.src.stop(time);
        this.osc.start();
        this.osc.stop(time);
    }

}
