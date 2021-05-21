import Sound, {SoundParam} from "./Sound";
import Channel, {ChannelParam} from "./Channel";

declare var window: any;
window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;

class Player {

    public bitrate: number = 44100;
    public ctx = new AudioContext();
    protected mix: { [id: string]: GainNode } = {};
    protected buff: { [id: string]: AudioBuffer } = {};

    async init() {
        const ctx = this.ctx;
        const bitrate = this.bitrate;
        if (ctx.state === "suspended") {
            await ctx.resume();
        }
        Sound.noise = ctx.createBuffer(1, bitrate * 2, bitrate)
        const out = Sound.noise.getChannelData(0);
        for (let i = 0; i < bitrate * 2; i++) {
            out[i] = Math.random() * 2 - 1;
        }
        const a = Math.pow(2, 1 / 12);
        for (let n = -69; n < 50; n++) {
            const value = Math.pow(a, n) * 440;
            const digit = Math.pow(10, (7 - value.toFixed().length));
            Channel.freq.push(Math.round(value * digit) / digit);
        }
    }

    mixer(id: string, volume = -1): GainNode {
        const ctx = this.ctx;
        const mix = this.mix;
        if (!(id in mix)) {
            mix[id] = ctx.createGain();
            mix[id].connect(ctx.destination);
        }
        if (volume >= 0 && volume <= 1) {
            mix[id].gain.value = volume;
        }
        return mix[id];
    }

    play(id: string, loop = false, gain = "master"): AudioBufferSourceNode {
        if (id in this.buff) {
            let src = this.ctx.createBufferSource();
            src.loop = loop;
            src.buffer = this.buff[id];
            src.connect(this.mixer(gain));
            src.start();
            return src;
        }
        return null;
    }

    async sound(id: string, param: SoundParam, freq: number | number[]) {
        const ctx = this.context(id, param[1]);
        const sound = new Sound(param, ctx);
        sound.render(freq);
        sound.start();
        await ctx.startRendering();
    }

    async music(id: string, params: ChannelParam[]) {
        const channels = params.map(param => new Channel(param));
        const time = Math.max(...channels.map(c => c.length));
        const ctx = this.context(id, time);
        channels.forEach((channel) => channel.render(ctx));
        await ctx.startRendering();
    }

    protected context(id: string, time: number): OfflineAudioContext {
        const ctx = new OfflineAudioContext(1, this.bitrate * time, this.bitrate);
        ctx.addEventListener("complete", (e) => this.buff[id] = e.renderedBuffer);
        return ctx;
    }

}

export default new Player();
