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

When the web page is loaded, the folling script serves as the entry point to the webcamRecognition.js script where the facial recognition models will be loaded and then used. 
```javascript
$(document).ready(function() 
{
    unknown_redundancy_count = 0;
    vacant_redundancy_count = 0;
    run()
})
```

The run function sets everyting up for the face recognition AI to work. It begins by loading the models. 
```javascript
// change to tiny face detector for faster rendering
await changeFaceDetector(TINY_FACE_DETECTOR);

// load models
await faceapi.loadFaceRecognitionModel(MODEL_URL);
await faceapi.loadFaceLandmarkModel(MODEL_URL);
await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
await faceapi.loadFaceExpressionModel(MODEL_URL);
await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
```

It then accesses the users webcam in order to stream video images for processing.
```javascript
const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
const videoEl = $('#inputVideo').get(0);
videoEl.srcObject = stream;
```
I then build the reference data, which is the photos that will be used for comparison with the target face. Once the models are loaded and the reference data is processed the onPlay function starts looking for faces in the video. The first action executed in the onPLay function is accessing the video element. That is performed using the following line:
```javascript
const videoEl = $('#inputVideo').get(0);
```
The next line is used to locate and retrieve data about the face that is in the video.
```javascript
const result = await faceapi.detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions().withFaceLandmarks().withFaceDescriptor();
```
If a descriptor is returned then it will be processed. I begin by collecting the face expression scores:
```javascript
if (result) {

  var neutral = result.expressions[0].probability;
  var happy = result.expressions[1].probability;
  var sad = result.expressions[2].probability;
  var angry = result.expressions[3].probability;
  var fearful = result.expressions[4].probability;
  var disgusted = result.expressions[5].probability;
  var surprised = result.expressions[6].probability;
```

I then find the max score in order to determine what facial expression the person is most likely exhibiting.
```javascript
  var max_exp = Math.max(neutral, happy, sad, angry, fearful, disgusted, surprised);
```

I then display the mood on the webpage. I use an XMLHttpRequest to retrieve the mood data and update the HTML dynamically. In this case, the request is for a file on the server that contains the mood data. 
```javascript
function updateMood(mood)
{
      // get the url parts for mood
      var begin_url = "http://127.0.0.1:8887/moods/";
      var file_type = ".txt";
        
       // build mood url
       var mood_url = begin_url.concat(mood);
       mood_url = mood_url.concat(file_type);
    
        var xhttp4 = new XMLHttpRequest();
        xhttp4.onload = function() {
        if (this.status == 200) {
            document.getElementById('mood').innerHTML = xhttp4.responseText;
        } else {
            console.warn("failed to load customer mood");
        }
      };
      xhttp4.open("GET", mood_url, true);
      xhttp4.send();
}
```
After the mood is determined, the face is compared to the faces in the database in order to find a match. 
```javascript
const bestMatch = faceMatcher.findBestMatch(result.descriptor);
```

If a match is returned, the name of the customer is displayed on the webpage, if that person is a known thief, that information will also be displayed. This is also performed using an XMLHtttpRequest. A few checks are performed here in order to save work. Since the AI is constantly checking the face that is in the screen, many matches are of the customer that has already been identified and whose information is already displayed on the web page, in this case, the data is not reloaded. The data is only reloaded if a new person is detected, a few cycles have gone by with no face detected, or if a new person is detected. 
```javascript
if (customer != prev_customer && customer != "unknown") {
    loadCustomerInfo(customer);

    // update the previous customer
    prev_customer = customer;
    unknown_redundancy_count = 0;
    vacant_redundancy_count = 0;
}
if (customer == "unknown") {
    unknown_redundancy_count++;
    prev_customer = customer;
}
if (customer == "unknown" && unknown_redundancy_count > 10) {
    loadCustomerInfo(customer);
    prev_customer = customer;
    unknown_redundancy_count = 0;
}
```

If no face is detected, and it has been empty for 40 cycles, the old customer info will no longer display on the web page. 
```javascript
if (vacant_redundancy_count > 40)
{
    loadCustomerInfo("empty");
    updateMood("empty");
    vacant_redundancy_count = 0;
    prev_customer = "unknown";
}
```

Finally, this process repeats indefinately.
```javascript
setTimeout(() => onPlay());
```
You can check out the full webcamRecognition.js script on Github [here](https://github.com/grantsingleton/face-recognition/blob/master/webcamRecognition.js).
