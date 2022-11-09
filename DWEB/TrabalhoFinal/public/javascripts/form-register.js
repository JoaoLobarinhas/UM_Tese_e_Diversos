var forms = null
var currentTab = 0;
let password = null
let email=null 
let studentNumber=null
let yearOption=null
var selectedOption = false
let typingTimerE;
let doneTypingIntervalE = 500;

let typingTimer;
let doneTypingInterval = 500;

window.addEventListener('load', function () {
  forms = document.getElementById('form');
  showTab(currentTab);

  firstName = this.document.getElementById("firstName")
  if(firstName){
    firstName.addEventListener("keyup", function(event){
      event.preventDefault();
      sizeNotZero(firstName.value,firstName.id)
    })
  }
  
  lastName = this.document.getElementById("lastName")
  if(lastName){
    lastName.addEventListener("keyup", function(event){
      event.preventDefault();
      sizeNotZero(lastName.value,lastName.id)
    })
  }
  
  email = this.document.getElementById("email")
  if(email){
    email.addEventListener("keyup", function(event){
      event.preventDefault();
      clearTimeout(typingTimerE);
      if(email.value){
        typingTimerE = setTimeout(checkEmail, doneTypingIntervalE);
      }
      else{
        sizeNotZero(email.value,email.id)
      }
    })
  }
  
  password = this.document.getElementById("password")
  if(password){
    password.addEventListener("keyup", function(event){
      event.preventDefault();
      checkPwd()  
    })
  }
 
  studentNumber = this.document.getElementById("studentNumber")
  if(studentNumber){
    studentNumber.addEventListener("keyup", function(event){
      event.preventDefault();
      clearTimeout(typingTimer);
      if (studentNumber.value){
        typingTimer = setTimeout(checkStudentNumber, doneTypingInterval);
      }
      else{
        sizeNotZero(studentNumber.value,studentNumber.id)
      }
    })
  }

  yearOption = this.document.getElementById("year")
  if(yearOption){
    yearOption.addEventListener("change", function(event){
      event.preventDefault();
      selectedOption = true
      yearOption.className = "form-control is-valid"
    })
  }

  $("#pictureProfile").on("change", function(){
    readURLProfile(this)
  })

  $("#pictureHeader").on("change", function(){
    readURLBackground(this)
  })

})

function sizeNotZero(value,idName){
  if(value == ""){
      this.document.getElementById(idName).className = "form-control is-invalid"
  }
  else{
      this.document.getElementById(idName).className = "form-control is-valid"
  }
}

function checkPwd(){
  let feedback = this.document.getElementById("passwordFeedback")
  if(password.value == ""){
    password.className = "form-control is-invalid"
    feedback.innerHTML = "Password is required."
    return false
  }
  else if(password.value.length <= 6){
    password.className = "form-control is-invalid"
    feedback.innerHTML = "Password needs to be at least 7 characters long."
    return false
  }
  else{
    password.className = "form-control is-valid"
    return true
  }
}

function checkEmail(){
  aux = true
  let feedback = this.document.getElementById("emailFeedback")
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  aux = re.test(email.value)
  if(aux){
    axios.get("http://localhost:3001/aux/checkEmail/"+email.value)
      .then(data=>{
        if(data.data == false){
          email.className = "form-control is-valid"
        }
        else{
          email.className = "form-control is-invalid"
          feedback.innerHTML = "Email allready registed."
          aux = false
        }
      })
      .catch(erro=>console.log(erro))
  }
  else{
    email.className = "form-control is-invalid"
    feedback.innerHTML = "Email is invalid."
    aux=false
  }
  return aux
}

function checkStudentNumber(){
  aux = true
  let feedback = this.document.getElementById("studentNumberFeedback")
  axios.get("http://localhost:3001/aux/checkSN/"+studentNumber.value)
    .then(data=>{
      console.log(data.data)
      if(data.data == false){
        studentNumber.className = "form-control is-valid"
      }
      else{
        studentNumber.className = "form-control is-invalid"
        feedback.innerHTML = "Student number allready registed."
        aux = false
      }
    })
    .catch(erro=>console.log(erro))
  return aux
}


function showTab(n) {
  forms.className = "needs-validation w-65"
  document.getElementById("nextBtn").className = "btn button-grad text-white"
  document.getElementById("load").className += " is-invisible"
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
  }else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }
}

function nextPrev(n) {
  var x = document.getElementsByClassName("tab");
  if (n == 1 && !validateForm()) return false;
  x[currentTab].style.display = "none";
  currentTab = currentTab + n;
  if (currentTab >= x.length) {
    $("#load").attr('class', 'needs-validation is-invisible');
    $("#form").attr('class', 'load');
    document.getElementById("form").submit();
    return false;
  }
  showTab(currentTab);
}

function validateForm() {
  var x, y, i, valid = true;
  x = document.getElementsByClassName("tab");
  y = x[currentTab].getElementsByTagName("input");
  for (i = 0; i < y.length; i++) {
    if (y[i].value == "") {
      if(y[i].id != "yearConclusion" || y[i].id != "pictureProfile" || y[i].id == "pictureHeader"){
        y[i].className += " is-invalid";
        valid = false;
      }
      if(y[i].id == "pictureProfile"){
        $("#PPFeedback").attr('class', 'form-text text-danger');
        $("#PPFeedback").text("You need to upload a profile picture.")
      }
      if(y[i].id == "pictureHeader"){
        $("#HPFeedback").attr('class', 'form-text text-danger');
        $("#HPFeedback").text("You need to upload a header picture.")
      }
    }
    else if(y[i].id == "password"){
      valid=checkPwd()
    }
    else if(y[i].id == "email" || y[i].id == "studentNumber"){
      if(y[i].className == "form-control is-invalid" || y[i].className == "form-control"){
        valid=false
      }
      else{
        valid=true
      }
    }
    else{
        y[i].className += " is-valid";
    }
  }
  y = x[currentTab].getElementsByTagName("select");
  for (i = 0; i < y.length; i++){
    if(y[i].id == "year"){
      if(selectedOption){
        y[i].className += " is-valid";
      }
      else{
        y[i].className += " is-invalid";
      }
      valid=selectedOption
    }
  } 
  return valid
}


function readURLProfile(input){
  if (input.files.length == 1){
    console.log(input.files[0].size)
    if(input.files[0].size <= 500000){
      var reader = new FileReader();
      reader.onload = function(e){
        var image = e.target.result;
        if(image.includes("data:image/gif") || image.includes("data:image/png") || image.includes("data:image/jpeg")){
          $('#profilePreview').attr('src', e.target.result);
          $("#PPFeedback").attr('class', 'form-text text-success');
          $("#PPFeedback").text("Valid photo.")
        }
        else{
          $("#PPFeedback").attr('class', 'form-text text-danger');
          $("#PPFeedback").text("File format is not valid.")
        }
      }
      reader.readAsDataURL(input.files[0]);
    }
    else{
      $("#PPFeedback").attr('class', 'form-text text-danger');
      $("#PPFeedback").text("Your profile picture can't be larger than 1mb.")
    }
  }
  else{
    $("#PPFeedback").attr('class', 'form-text text-danger');
    $("#PPFeedback").text("You can't upload more than one photo per input.")
  }
}

function readURLBackground(input){
  if (input.files.length == 1){
    if(input.files[0].size <= 500000){
      var reader = new FileReader();
      reader.onload = function(e){
        var image = e.target.result;
        if(image.includes("data:image/gif") || image.includes("data:image/png") || image.includes("data:image/jpeg")){
          $('#headerPreview').css("background-image", "url("+e.target.result+")")
          $("#HPFeedback").attr('class', 'form-text text-success');
          $("#HPFeedback").text("Valid photo.")
        }
        else{
          $("#HPFeedback").attr('class', 'form-text text-danger');
          $("#HPFeedback").text("File format is not valid.")
        }
      }
      reader.readAsDataURL(input.files[0]);
    }
    else{
      $("#HPFeedback").attr('class', 'form-text text-danger');
      $("#HPFeedback").text("Your header picture can't be larger than 1mb.")
    }
  }
  else{
    $("#HPFeedback").attr('class', 'form-text text-danger');
    $("#HPFeedback").text("You can't upload more than one photo per input.")
  }
}

