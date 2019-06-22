var faceMatcher;
var prev_customer;
var previous_mood;
//used to keep track of how many times an unknown face is read
var unknown_redundancy_count;
//used to keep track of how many consecutive video frames are empty
var vacant_redundancy_count;

async function onPlay() 
{
        
      // access video element (webcam here)
      const videoEl = $('#inputVideo').get(0);

      // wait for initialization to finish    
      if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded() || !faceMatcher)
      return setTimeout(() => onPlay());
        
      // collect the face descriptor of whoever is in the video     
      const result = await faceapi.detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions().withFaceLandmarks().withFaceDescriptor();
      
      // if there is a descriptor, process it
      if (result) {
          //drawExpressions(videoEl, $('#overlay').get(0), [result], false);

        // collect the face expression scores
      var neutral = result.expressions[0].probability;
      var happy = result.expressions[1].probability;
      var sad = result.expressions[2].probability;
      var angry = result.expressions[3].probability;
      var fearful = result.expressions[4].probability;
      var disgusted = result.expressions[5].probability;
      var surprised = result.expressions[6].probability;
    
      // find the max value of the face expression scores
      var max_exp = Math.max(neutral, happy, sad, angry, fearful, disgusted, surprised);
    
      // associate that number with its name
      var mood;
      if (max_exp === neutral) {mood = "neutral"}
      else if (max_exp === happy) {mood = "happy"}
      else if (max_exp === sad) {mood = "sad"}
      else if (max_exp === angry) {mood = "angry"}
      else if (max_exp === fearful) {mood = "fearful"}
      else if (max_exp === disgusted) {mood = "disgusted"}
      else if (max_exp === surprised) {mood = "surprised"}
      else {mood = "none"}
    
      console.log(mood);  
      
      if (mood != previous_mood)
      {
          updateMood(mood);
      }
      previous_mood = mood;
          
          
        // Calculate who is in the video  
        const bestMatch = faceMatcher.findBestMatch(result.descriptor);
        //console.log(bestMatch.toString()); 
          
        var customer = bestMatch.label;
    
        if (customer != prev_customer && customer != "unknown") 
        {
            loadCustomerInfo(customer);
            
            // update the previous customer
            prev_customer = customer;
            unknown_redundancy_count = 0;
            vacant_redundancy_count = 0;
        }
        if (customer == "unknown")
        {
            unknown_redundancy_count++;
            prev_customer = customer;
        }
        if (customer == "unknown" && unknown_redundancy_count > 10)
        {
            loadCustomerInfo(customer);
            prev_customer = customer;
            unknown_redundancy_count = 0;
        }
      } 
      else
      {
          // if the screen has been empty, reset the customer info
          vacant_redundancy_count++;
          
          if (vacant_redundancy_count > 40)
          {
              loadCustomerInfo("empty");
              updateMood("empty");
              vacant_redundancy_count = 0;
              prev_customer = "unknown";
          }
      }
        
      // continuous loop    
      setTimeout(() => onPlay());
    }

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
        }
        else 
        {
            console.warn("failed to load customer mood");
        }
      };
      xhttp4.open("GET", mood_url, true);
      xhttp4.send();
}

async function run() 
{
        
    const MODEL_URL = 'http://127.0.0.1:8887/weights';
        
      // change to tiny face detector for faster rendering
      await changeFaceDetector(TINY_FACE_DETECTOR);
        
      // load models
      await faceapi.loadFaceRecognitionModel(MODEL_URL);
      await faceapi.loadFaceLandmarkModel(MODEL_URL);
      await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
      await faceapi.loadFaceExpressionModel(MODEL_URL);
      await faceapi.loadSsdMobilenetv1Model(MODEL_URL)

      changeInputSize(224);
        
      // access users webcam and stream the images
      // to the video element
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
      const videoEl = $('#inputVideo').get(0);
      videoEl.srcObject = stream;
    
      buildReferenceData();
    }

// This is the database of faces which will be used to 
// recognize who is in front of the camera
async function buildReferenceData()
{
        // Add Grant
        const grant_img = await faceapi.fetchImage('http://127.0.0.1:8887/images/Grant.jpg')
        const results = await faceapi.detectSingleFace(grant_img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
        
        if (!results) 
        {
            console.log("img detect failed");
            return;
        }
        
        
        // Add Krista
        const krista_img = await faceapi.fetchImage('http://127.0.0.1:8887/images/Krista_1.jpg')
        const results2 = await faceapi.detectSingleFace(krista_img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
        
        if (!results2) 
        {
            console.log("img detect failed");
            return;
        }
        
        
        // Add Tarek
        const tarek_img = await faceapi.fetchImage('http://127.0.0.1:8887/images/Tarek.jpg')
        const results3 = await faceapi.detectSingleFace(tarek_img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
        
        if (!results3) 
        {
            console.log("img detect failed");
            return;
        }
        
        // Add Daniel
        const daniel_img = await faceapi.fetchImage('http://127.0.0.1:8887/images/Daniel.jpg')
        const results4 = await faceapi.detectSingleFace(daniel_img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
        
        if (!results4) 
        {
            console.log("img detect failed");
            return;
        }
        
    
        // Associate names with faces
        const labeledDescriptors = [
                new faceapi.LabeledFaceDescriptors(
                    "Grant Singleton",
                    [results.descriptor]
                    ),
                new faceapi.LabeledFaceDescriptors(
                     "Krista Singleton",
                     [results2.descriptor]
                     ),
                new faceapi.LabeledFaceDescriptors(
                    "Tarek Adlouni",
                    [results3.descriptor]
                    ),
                new faceapi.LabeledFaceDescriptors(
                    "Daniel Patlovany",
                    [results4.descriptor]
                    )
            ]
        
        // load the faces and associated names into faceMatcher
        faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    }
    
function loadCustomerInfo(customer) 
{
        // get the url parts for name
        var begin_url = "http://127.0.0.1:8887/customers/";
        var file_type = ".txt";
        var first_name = customer.split(" ", 1);
        
        // build url for name
        var name_url = begin_url.concat(first_name);
        name_url = name_url.concat(file_type);
    
        // get url part for id
        var end_url = "_id.txt";
    
        // build url for id
        var id_url = begin_url.concat(first_name);
        id_url = id_url.concat(end_url);
    
        // get url part for status
        var stat_end_url = "_status.txt";
    
        // build url for status
        var status_url = begin_url.concat(first_name);
        status_url = status_url.concat(stat_end_url);

        /** Change the customer name **/
        var xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
        if (this.status == 200) {
            document.getElementById('cust_name').innerHTML = xhttp.responseText;
        }
        else 
        {
            console.warn("failed to load customer name");
        }
      };
      xhttp.open("GET", name_url, true);
      xhttp.send();
    
        /** Change the customer ID **/    
        var xhttp2 = new XMLHttpRequest();
        xhttp2.onload = function() {
        if (this.status == 200) {
            document.getElementById('cust_id').innerHTML = xhttp2.responseText;
        }
        else 
        {
            console.warn("failed to load customer id");
        }
      };
      xhttp2.open("GET", id_url, true);
      xhttp2.send();
    
            /** Change the customer status **/    
        var xhttp3 = new XMLHttpRequest();
        xhttp3.onload = function() {
        if (this.status == 200) {
            document.getElementById('status').innerHTML = xhttp3.responseText;
        }
        else 
        {
            console.warn("failed to load customer status");
        }
      };
      xhttp3.open("GET", status_url, true);
      xhttp3.send();        

    } 

$(document).ready(function() 
{
    unknown_redundancy_count = 0;
    vacant_redundancy_count = 0;
    run()
})