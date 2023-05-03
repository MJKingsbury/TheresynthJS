import React, { useState, useEffect } from 'react';

let oscsList;
let waveshaper;
let distortion;
let phaser;
let chorus;
let vibrato;
let filter;
let limiter;
let volnode;
let reverb;

let oscillator;

//Frequencies and their corresponding Notes
const notes = {
    16.35 : "C0", 17.32 : "C#0", 18.35 : "D0", 19.45 : "D#0", 20.60 : "E0", 21.83 : "F0", 
    23.12 : "F#0", 24.50 : "G0", 25.96 : "G#0", 27.50 : "A0", 29.14 : "A#0", 30.87 : "B0",
    32.70 : "C1", 34.65 : "C#1", 36.71 : "D1", 38.89 : "D#1", 41.20 : "E1", 43.65 : "F1", 
    46.25 : "F#1", 49.01 : "G1", 51.91 : "G#1", 55.01 : "A1", 58.27 : "A#1", 61.74 : "B1",
    65.41 : "C2", 69.30 : "C#2", 73.42 : "D2", 77.78 : "D#2", 82.41 : "E2", 87.31 : "F2", 
    92.50 : "F#2", 98.01 : "G2", 103.83 : "G#2", 110.01 : "A2", 116.54 : "A#2", 123.47 : "B2",
    130.81 : "C3", 138.59 : "C#3", 146.83 : "D3", 155.56 : "D#3", 164.81 : "E3", 174.61 : "F3", 
    185.01 : "F#3", 196.01 : "G3", 207.65 : "G#3", 220.01 : "A3", 233.08 : "A#3", 246.94 : "B3",
    261.63 : "C4", 277.18 : "C#4", 193.66 : "D4", 311.13 : "D#4", 329.63 : "E4", 349.23 : "F4", 
    369.99 : "F#4", 392.01 : "G4", 415.30 : "G#4", 440.01 : "A4", 466.16 : "A#4", 493.88 : "B4",
    523.25 : "C5", 554.37 : "C#5", 587.33 : "D5", 622.25 : "D#5", 659.25 : "E5", 698.46 : "F5", 
    739.99 : "F#5", 783.99 : "G5", 830.61 : "G#5", 880.01 : "A5", 923.33 : "A#5", 987.77 : "B5",
    1046.50 : "C6", 1108.73 : "C#6", 1174.66 : "D6", 1244.51 : "D#6", 1318.51 : "E6", 1396.91 : "F6", 
    1479.98 : "F#6", 1567.98 : "G6", 1661.22 : "G#6", 1760.01 : "A6", 1864.66 : "A#6", 1975.53 : "B6",
    2093.01 : "C7", 2217.46 : "C#7", 2349.32 : "D7", 2489.02 : "D#7", 2637.02 : "E7", 2793.83 : "F7", 
    2959.96 : "F#7", 3135.96 : "G7", 3322.44 : "G#7", 3520.01 : "A7", 3729.31 : "A#7", 3951.07 : "B7",
    4186.01 : "C8", 4434.92 : "C#8", 4698.63 : "D8", 4978.03 : "D#8", 5274.04 : "E8", 5587.65 : "F8", 
    5919.91 : "F#8", 6271.93 : "G8", 6644.88 : "G#8", 7040.01 : "A8", 7458.62 : "A#8", 7902.13 : "B8",
};
//Arrays of Keys
const keys = [...Object.keys(notes).map(n => Number(n))];

//<-- UTILITIES -->
//Clip -> Clips values to fit relevant scale
const clip = (value, isFrequency) => {
    if (value < 0) return 0;
    if (isFrequency && value > 20000) return 20000;
    return value;
}

//Maps Coordinate Values (20 -> 440) to Frequency Values (0 -> 20000)
const mapFreq = (f) => { 
    const freq = 20000 * (1 - (f - 20) / (440 - 20));
    return clip(100 * Math.exp(freq / 4000), true);
}

//Maps Coordinate Values (30 -> 600) to Decibel Values (-12 -> 0)
const mapVol = (v) => {
    const vol = 12 * ((v - 30) / (600 - 30));
    return -12 + clip(vol, false);
}

//Get the next note after the current frequency value
const getNote = (f) => {
    const nextNote = keys.find(x => x >= f);
    return nextNote ? nextNote : keys[keys.length - 1];
}

//Custom Hook to force component rerenders when Effect Button value changes
const useRerender = () => {
    const [value, setValue] = useState(false);
    const rerender = () => setValue(!value);
    return rerender;
}

export const Synth = ({input, tone}) => {

    const [isFixed, setIsFixed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [frequency, setFrequency] = useState(0);
    const [volume, setVolume] = useState(-Infinity);

    const rerender = useRerender();

    useEffect(() => {
        try {
            //Oscillators
            const sinOsc = new tone.MonoSynth({
                oscillator: {
                    type: "sine"
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.25,
                    sustain: 0.75,
                    release: 0.05
                }
            });
            const triOsc = new tone.MonoSynth({
                oscillator: {
                    type: "triangle"
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.25,
                    sustain: 0.75,
                    release: 0.05
                }
            });
            const sawOsc = new tone.MonoSynth({
                oscillator: {
                    type: "sawtooth"
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.25,
                    sustain: 0.75,
                    release: 0.05
                }
            });
            const sqrOsc = new tone.MonoSynth({
                oscillator: {
                    type: "square"
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.25,
                    sustain: 0.75,
                    release: 0.05
                }
            });
            oscsList = [sinOsc, triOsc, sawOsc, sqrOsc];

            //Effects
            waveshaper = new tone.Chebyshev(10);
            distortion = new tone.Distortion(0.75);
            phaser = new tone.Phaser({frequency: 0.8, octaves: 2, baseFrequency: 300});
            chorus = new tone.Chorus(3, 2.5, 0.5);
            vibrato = new tone.Vibrato(3, 1);

            waveshaper.set({wet: 0});
            distortion.set({wet: 0});
            phaser.set({wet: 0});
            chorus.set({wet: 0});
            vibrato.set({wet: 0});

            chorus.start();

            //Components
            filter = new tone.Filter(5000, "lowpass", -24);
            reverb = new tone.Reverb();
            limiter = new tone.Limiter(0);
            volnode = new tone.Volume(-Infinity);

            //Connect Chain
            for (const osc of oscsList) {
                osc.chain(
                    waveshaper, distortion, phaser, chorus, vibrato, filter, reverb, limiter, volnode, tone.Destination
                );
            }
            //Default Oscillator
            console.log("Starting Oscillator");
            oscillator = oscsList[0];
            console.log(oscillator);
        }
        catch(error) { 
            console.warn(error) 
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (oscsList) {
            if (input && typeof(input) !== "string") {
                setFrequency(mapFreq(input.y))
                setVolume(mapVol(input.x))
                volnode.volume.value = volume;
                vibrato.set({wet: (input.v) ? 1 : 0});
                if (isPlaying) {
                    if (isFixed) {
                        oscillator.setNote(getNote(frequency));
                    }
                    else {
                        oscillator.setNote(frequency);
                    }    
                }
                else {
                    if (isFixed) {
                        oscillator.triggerAttack(getNote(frequency));
                    }
                    else {
                        oscillator.triggerAttack(frequency);
                    }
                    setIsPlaying(true);
                }
            }
            else if (isPlaying) {
                oscillator.triggerRelease();
                setIsPlaying(false);
            }
        }
    }, [input, isPlaying, isFixed, frequency, volume]);

    const SwitchOsc = () => {
        const val = document.getElementById("osc-select").value;
        // eslint-disable-next-line
        switch (val) {
            case "0":
                document.getElementById("osc-labels").innerHTML = "Sine";
                break;
            case "1":
                document.getElementById("osc-labels").innerHTML = "Triangle";
                break;
            case "2":
                document.getElementById("osc-labels").innerHTML = "Sawtooth";
                break;
            case "3":
                document.getElementById("osc-labels").innerHTML = "Square";
                break;
        }
        try {
            oscillator.triggerRelease(tone.now());
            oscillator = oscsList[val];
            oscillator.triggerAttack(frequency, tone.now() + 0.05);
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleEffect = (effect) => {
        if (effect.isOn === 1) {
            effect.set({wet: 0});
            effect.isOn = 0;
        }
        else {
            effect.set({wet: 0.5});
            effect.isOn = 1;
        }
        rerender();
    }

    return(
        <div>
            <div>
                <label id="osc-labels" htmlFor="osc-select">Sine</label>
                <input 
                    id="osc-select" 
                    data-testid="r" 
                    type="range" 
                    min="0" 
                    max="3" 
                    step="1" 
                    defaultValue="0" 
                    onInput={SwitchOsc}
                    onChange={SwitchOsc}></input>
                <p>Frequency: {frequency}Hz</p>
                <p>Volume: {volume}db</p>
                <p>Nearest Note: {notes[getNote(frequency)]}</p>
            </div>
            <div id="Effects">
                <button id="Waveshaper" onClick={() => handleEffect(waveshaper)}>
                    Waveshaper: {waveshaper && waveshaper.isOn ? "On" : "Off"}
                </button>{' '}
                <button id="Distortion" onClick={() => handleEffect(distortion)}>
                    Distortion: {distortion && distortion.isOn ? "On" : "Off"}
                </button>{' '}
                <button id="Phaser" onClick={() => handleEffect(phaser)}>
                    Phaser: {phaser && phaser.isOn ? "On" : "Off"}
                </button>{' '}
                <button id="Chorus" onClick={() => handleEffect(chorus)}>
                    Chorus: {chorus && chorus.isOn ? "On" : "Off"}
                </button><br></br>
                <button id="Fixed" onClick={() => setIsFixed(!isFixed)}>
                    Used Fixed Frequency Tones: {isFixed ? "On" : "Off"}
                </button>
            </div>
        </div>
    )

}

/*
 */