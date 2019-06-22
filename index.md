## Description
In this project, I run a facial recognition AI in Javascript, using the open-source facial recognition API called [face-API.js](https://github.com/justadudewhohacks/face-api.js?files=1). Using the computers built in webcam to live stream video, this AI is able to identify a person (if their photo is uploaded to its database), and also identify whether that person looks surprised, happy, angry etc. This was built as a project in my Programming Studio class at Texas A & M. The purpose of this project was to create a hypothetical 'customer tracking' system. The system would keep a database of faces, which could be used to identify customers, but it would also maintain a database of common thieves faces so that a known thief would quickly be recognized. This system would be ideal for companies like Best Buy who have a security guard constantly monitoring the cameras. This system would alert the security guard that the person who just entered is a known thief. The guard could then keep a closer eye on that person. We built this web app as a team of three, I was responsible for implementing the facial recognition system. 

## Tools 
* HTML
* Javascript
* ECMAScript 6 (ES6)
* [face-API.js](https://github.com/justadudewhohacks/face-api.js?files=1)

## Implementation
### In the HTML
In order to access a computers webcam through the browser, I added a div in the html for the video element to be placed. This is where the video will be displyed on the web page. A canvas element is added on top of the video element in order to draw boxes (or anything else) around the face that is detected.  
```html
<div style="position: relative" class="margin">
  <video onloadedmetadata="onPlay(this)" id="inputVideo" autoplay muted></video>
  <canvas id="overlay" />
</div>
```
When the meta data is loaded, the onPLay function in webcamRecognition.js script is executed. this is the script that I wrote to implement the face recognition API. 

### webcamRecognition.js


