import { useState, useEffect } from 'react';
import { HandTracker } from './Handtracker.js';
import { Synth } from './Synthesizer.js';
import * as Tone from 'tone';
import './App.css';

let handtracker;

const App = () => {
  const [data, setData] = useState(undefined);
  const [isPlaying, setIsPlaying] = useState(false);

  //Setup
  useEffect(() => {
    const video = document.getElementById("video");
    navigator.mediaDevices.getUserMedia({video : true, audio: false})
      .then(stream => {
        video.srcObject = stream;
        console.log(video);
        video.onloadedmetadata = () => {
          handtracker = new HandTracker(video, setData, setIsPlaying);
          handtracker.load();
          console.log(handtracker);
        }
      })
  }, []);

  //Handling Data from HandtrackJS
  useEffect(() => {
    const caption = document.getElementById("caption");
    switch (data) {
      case undefined               :
        caption.innerHTML = "Waiting to Begin Capture";
        break;
      case "ModelLoadError"        :
        caption.innerHTML = "An Error Occurred Loading The Model";
        break;
      case "VideoStartError"       :
        caption.innerHTML = "The Video Was Unable To Start";
        break;
      case "ModelPredictionsError" :
        caption.innerHTML = "Loading...";
        break;
      case "SubHandsValueError"    :
        if (isPlaying) {
          caption.innerHTML = "Please Ensure Only One Hand Is Clearly Visible To Camera";
        }
        break;
      case "Paused"                :
        caption.innerHTML = "Paused";
        break;
      default                      :
        if (isPlaying) { 
          caption.innerHTML = "Tracking Hands";
        }
        break;
    }
    console.log(caption.innerHTML);
  }, [data, isPlaying])

  const handleClick = async() => {
    if (!handtracker) return;
    if (!isPlaying) await Tone.start();
    isPlaying ? handtracker.stop() : handtracker.start();
  }

  return (
    <div>
      <div>
        <figure id="figure">
          <video id="video"></video>
          <figcaption id="caption"></figcaption>
          {isPlaying
          ? <button onClick={handleClick}>Pause Capture</button>
          : <button onClick={handleClick}>Begin Capture</button> }
        </figure>
        </div>
      <div style = {{position:"relative"}}>
        <Synth input={data} tone={Tone}></Synth>
      </div>
    </div>
  );
}
export default App;
