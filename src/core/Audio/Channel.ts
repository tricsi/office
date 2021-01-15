import Sound, { SoundParam } from "./Sound";

export type ChannelParam = [
    /** Sound parameters */
    SoundParam,
    /** Notes */
    string,
    /** Tempo */
    number
];

export default class Channel {

    static keys = "c,db,d,eb,e,f,gb,g,ab,a,bb,b".split(",");
    static freq: number[] = [];
    data: number[][];
    size = 0;
    length = 0;

    constructor(public param: ChannelParam) {
        const [sound, notes, tempo] = param;
        const sheet = notes.split("|");
        this.data = sheet
            .reduce((p, n, i) => p + (i % 2 ? ("," + sheet[i - 1]).repeat(parseInt(n) - 1) : (p ? "," : "") + n), "")
            .split(",")
            .map((code) => {
                const div = code.match(/^([\d\.]+)/);
                if (div) {
                    const time = parseFloat(div[1]);
                    this.length += time * tempo;
                    const freqs = code.match(/([a-z]+\d+)/g);
                    if (!freqs) {
                        return [time];
                    }
                    this.size = Math.max(freqs.length, this.size);
                    return [time].concat(freqs.map(f => {
                        let note = f.match(/([a-z]+)(\d+)/);
                        return note ? Channel.freq[parseInt(note[2]) * 12 + Channel.keys.indexOf(note[1])] : 0;
                    }));
                }
            });
    }

    render(ctx: OfflineAudioContext) {
        let time = 0;
        const [sound, notes, tempo] = this.param;
        const sounds: Sound[] = [];
        for (let i = 0; i < this.size; i++) {
            sounds.push(new Sound(sound, ctx));
        }
        this.data.forEach(note => {
            const t = note[0] * tempo;
            sounds.forEach((sound, i) => sound.render(note[i + 1] || 0, t, time));
            time += t;
        });
        sounds.forEach(sound => sound.start(time));
    }

}
