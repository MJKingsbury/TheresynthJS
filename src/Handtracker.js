import * as handTrack from 'handtrackjs';

export class HandTracker {
    constructor(video, setData, setIsPlaying) {
        this.video = video;
        this.model = undefined;
        this.params = {
            flipHorizontal: false,
            outputStride: 16,
            imageScaleFactor: 0.5,
            maxNumBoxes: 3,
            iouThreshold: 0.2,
            scoreThreshold: 0.5,
            modelType: "ssd320fpnlite",
            modelSize: "small",
            bboxLineWidth: "2",
            fontSize: 17,
        };
        this.setData = setData;
        this.setIsPlaying = setIsPlaying;
    }

    load() {
        handTrack.load(this.params)
            .then(lmodel => {
                this.model = lmodel
                if (!this.model) {
                    console.warn("Model Not Loaded.");
                    throw new Error("ModelLoadError");
                }
                else {
                    console.log("Model Loaded Successfully.");
                }
            })
            .catch(error => {
                this.setData("ModelLoadError");
                console.error(error);
            });
    }

    start() {
        handTrack.startVideo(this.video)
            .then(status => {
                if (status) {
                    this.setIsPlaying(true)
                    console.log("Video Started.");
                    this.#predict();
                }
            })
            .catch(error => {
                this.setData("VideoStartError");
                console.error(error);
            })
    }

    #predict() {
        this.video.style.height = "";
        this.model.detect(this.video)
            .then(predictions => {
                if (predictions.length === 1 || predictions.length === 2) {
                    let results = {};
                    let handsCount = 0;
                    for (const mark of predictions) {
                        if (mark.label !== "face") {
                            results.c = (mark.label === "closed");
                            results.v = (mark.label === "pinch");
                            const mX = mark.bbox[0] + mark.bbox[2] / 2;
                            const mY = mark.bbox[1] + mark.bbox[3] / 2;
                            results.x = mX;
                            results.y = mY
                            ++handsCount;
                        }
                    }
                    if (results.c) {
                        this.setData("Paused");
                    }
                    else if (handsCount >= 2) {
                        this.setData("LimHandsValueError");
                    }
                    else if (handsCount < 1) {
                        this.setData("SubHandsValueError");
                    } 
                    else {
                        this.setData(results);
                    }
                }
                else {
                    this.setData("SubHandsValueError");
                }
                requestAnimationFrame(this.#predict.bind(this));
            })
            .catch(error => {
                this.setData("ModelPredictionsError");
            })
    }

    stop() {
        this.setIsPlaying(false)
        handTrack.stopVideo();
        this.setData("Paused");
        console.log("Video Paused");
    }
}