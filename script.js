let video = document.querySelector("video");   //getting the video tag of html
let vidbtn = document.querySelector("button#record");
let capbtn = document.querySelector("button#capture");
let filter = document.querySelectorAll(".filters");
let body = document.querySelector("body");
let zoomin = document.querySelector(".zoom-in");
let zoomout = document.querySelector(".zoom-out");
let galleryBtn = document.querySelector("#gallery");
let constraints = { video: true, audio: false };               //type of media we want from the browser
let mediaRecorder;
let chunks = [];                                    //array for storing videos for a interval
let isRecording = false;

let minzoom = 1;
let maxzoom = 3;
let currzoom = 1;

let filterSel = "";
for (let i = 0; i < filter.length; i++) {
    filter[i].addEventListener("click", function (e) {
        filterSel = e.currentTarget.style.backgroundColor;
        removeFilter();
        applyFilter(filterSel);
    });
}

galleryBtn.addEventListener("click", function () {
    location.assign("gallery.html");
});

zoomin.addEventListener("click", function () {
    let videocurrscale = video.style.transform.split("(")[1].split(")")[0];
    if (videocurrscale > maxzoom) {
        return;
    }
    else {
        currzoom = Number(videocurrscale) + 0.1;
        video.style.transform = `scale(${currzoom})`;
    }
});

zoomout.addEventListener("click", function () {

    if (currzoom > minzoom) {
        currzoom -= 0.1;
        video.style.transform = `scale(${currzoom})`;
    }
})

vidbtn.addEventListener("click", function () {
    let innerDiv = vidbtn.querySelector("div");
    if (isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        innerDiv.classList.remove("record-animation");
    }
    else {
        mediaRecorder.start();
        filterSel = "";
        removeFilter();
        isRecording = true;
        innerDiv.classList.add("record-animation");
    }
});

capbtn.addEventListener("click", function () {
    let innerDiv = capbtn.querySelector("div");
    innerDiv.classList.add("capture-animation");
    setTimeout(function () {
        innerDiv.classList.remove("capture-animation");
    }, 400)
    capture();
});
//navigator - it allows the browser to get access of the mediadevice we specify
//mediaDevice - type of media audio or video which to access
navigator.mediaDevices.getUserMedia(constraints).then(function (mediaStream) {
    video.srcObject = mediaStream;                  //adding source of the video tag as mediastream
    mediaRecorder = new MediaRecorder(mediaStream);
    // audio.srcObject = mediaStream;


    // dataavailable - an event when a recording is started and a data is available on the mediastream
    mediaRecorder.addEventListener("dataavailable", function (e) {
        chunks.push(e.data);
    });

    // stop - an event occured when recording is given a stop command
    mediaRecorder.addEventListener("stop", function () {
        let blob = new Blob(chunks, { type: "video/mp4" }); //blob ek raw data hain jaha pr chunks ek video khtm hone ke baad store hote h
        addMedia("video", blob);
        chunks = [];

        let url = URL.createObjectURL(blob);              //blob file jo browser par hain use ek url m store kar diya h

        let a = document.createElement("a");        //anchor tag se video file download hogi;
        a.href = url;
        a.download = "video.mp4";
        a.click();
        a.remove();
    });
});

function capture() {
    let c = document.createElement("canvas");
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    let ctx = c.getContext("2d");

    ctx.translate(c.width/2 , c.height/2);
    ctx.scale(currzoom , currzoom);
    ctx.translate(-c.width/2 , -c.height/2);

    ctx.drawImage(video, 0, 0);
    if (filterSel != "") {
        ctx.fillStyle = filterSel;
        ctx.fillRect(0, 0, c.width, c.height);
    }
    let a = document.createElement("a");
    // a.download = "image.jpg";
    a.href = c.toDataURL();
    addMedia("img", c.toDataURL());
    a.click();
    a.remove();
}
function applyFilter(filterColor) {
    let filterDiv = document.createElement("div");
    filterDiv.classList.add("filter-div");
    filterDiv.style.backgroundColor = filterColor;
    body.appendChild(filterDiv);
}

function removeFilter() {
    let filterDiv = document.querySelector(".filter-div");
    if (filterDiv) {
        filterDiv.remove();
    }
}