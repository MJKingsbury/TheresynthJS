import React, { useState, useEffect } from 'react';

let oscsList;
let waveshaper;
let distortion;
let phaser;
let chorus;
let filter;
let limiter;
let volnode;
let reverb;

let oscillator;

//<-- UTILITIES -->
//Clip -> Clips values to fit relevant scale
const clip = (value, isFrequency) => {
    if (value < 0) return 0;
    if (isFrequency && value > 20000) return 20000;
    if (!isFrequency && value > 1) return 1;
    return value;
}

//Maps Coordinate Values to Frequency Values (0 -> 20000)
const mapFreq = (f) => { 
    const freq = 20000 * (1 - (f - 20) / (440 - 20));
    return clip(100 * Math.exp(freq / 3500), true);
}

//Maps Coordinate Values to Decibel Values
const mapVol = (v) => {
    return -6;
}

export const Synth = ({input, isTracking, tone}) => {

    const [isPlaying, setIsPlaying] = useState(false);
    const [frequency, setFrequency] = useState(0);
    const [volume, setVolume] = useState(-Infinity);

    useEffect(() => {
        //Oscillators
        const sinOsc = new tone.MonoSynth({
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.01,
                decay: 0.25,
                sustain: 0.25,
                release: 0.8
            }
        });
        const triOsc = new tone.MonoSynth({
            oscillator: {
                type: "triangle"
            },
            envelope: {
                attack: 0.01,
                decay: 0.25,
                sustain: 0.25,
                release: 0.8
            }
        });
        const sawOsc = new tone.MonoSynth({
            oscillator: {
                type: "sawtooth"
            },
            envelope: {
                attack: 0.01,
                decay: 0.25,
                sustain: 0.25,
                release: 0.8
            }
        });
        const sqrOsc = new tone.MonoSynth({
            oscillator: {
                type: "square"
            },
            envelope: {
                attack: 0.01,
                decay: 0.25,
                sustain: 0.25,
                release: 0.8
            }
        });
        oscsList = [sinOsc, triOsc, sawOsc, sqrOsc];

        //Effects Chain
        waveshaper = new tone.Chebyshev(10);
        distortion = new tone.Distortion(0.75);
        phaser = new tone.Phaser({frequency: 15, octaves: 3, baseFrequency: 1000});
        chorus = new tone.Chorus(4, 2.5, 0.5);

        waveshaper.set({wet: 0});
        distortion.set({wet: 0});
        phaser.set({wet: 0});
        chorus.set({wet: 0});

        chorus.start();

        //Components
        filter = new tone.Filter(1000, "highpass", -12);
        limiter = new tone.Limiter(-1);
        volnode = new tone.Volume(-Infinity);
        reverb = new tone.Reverb();

        //Connect Chain
        for (const osc of oscsList) {
            osc.chain(
                waveshaper, distortion, phaser, chorus, filter, limiter, volnode, reverb, tone.Destination
            );
        }

        //Default Oscillator
        console.log("Starting Oscillator");
        oscillator = oscsList[0];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (oscsList) {
            if (input && typeof(input) !== "string") {
                setFrequency(mapFreq(input.y))
                setVolume(mapVol(input.x))
                volnode.volume.value = volume;
                if (isPlaying) {
                    oscillator.setNote(frequency);
                }
                else {
                    oscillator.triggerAttack(frequency);
                    setIsPlaying(true);
                }
            }
            else if (isPlaying) {
                if (input === "Paused") {
                    volnode.volume.value = -Infinity;
                }
                oscillator.triggerRelease();
                setIsPlaying(false);
            }
        }
    }, [input, isPlaying, frequency, volume]);

    const switchOsc = () => {
        oscillator.triggerRelease();
        oscillator = oscsList[document.getElementById("osc-select").value]
        oscillator.triggerAttack(frequency);
    }

    const handleEffect = (effect) => {
        if (effect.isOn === 1) {
            effect.set({wet: 0});
            effect.isOn = 0;
        }
        else {
            effect.set({wet: 1});
            effect.isOn = 1;
        }
    }

    return(
        <div>
            <div>
                <input id="osc-select" type="range" min="0" max="3" step="1" defaultValue="0" onInput={switchOsc}></input>
                <p>{frequency}</p>
                <p>{volume}</p>
            </div>
            <div id="Effects">
                <button id="Waveshaper" onClick={() => handleEffect(waveshaper)}>
                    Waveshaper: {waveshaper && waveshaper.isOn ? "On" : "Off"}
                </button><br></br>
                <button id="Distortion" onClick={() => handleEffect(distortion)}>
                    Distortion: {distortion && distortion.isOn ? "On" : "Off"}
                </button><br></br>
                <button id="Phaser" onClick={() => handleEffect(phaser)}>
                    Phaser: {phaser && phaser.isOn ? "On" : "Off"}
                </button><br></br>
                <button id="Chorus" onClick={() => handleEffect(chorus)}>
                    Chorus: {chorus && chorus.isOn ? "On" : "Off"}
                </button><br></br>
            </div>
        </div>
    )

}