let typingTimer;
let doneTypingInterval = 500;
var selectedOption = false

$(document).ready(function() {

    aux = $("#number").text()
    aux = aux.split(": ")
    console.log(aux)
    const number = aux[1]
    console.log(number)

    if ($("#firstName").length){
        $("#firstName").keyup(function(){
            sizeNotZero($("#firstName").val(),$('#firstName').attr('id'))
        })
    }

    if ($("#lastName").length){
        $("#lastName").keyup(function(){
            sizeNotZero($("#lastName").val(),$('#lastName').attr('id'))
        })
    }

    if ($("#studentNumber").length){
        $("#studentNumber").keyup(function(){
            clearTimeout(typingTimer);
            if($("#studentNumber").val()){
                typingTimer = setTimeout(checkStudentNumber, doneTypingInterval, number);
            }
            else{
                sizeNotZero($("#studentNumber").val(),$('#studentNumber').attr('id'))
            }
        })
    }

    if ($("#year").length){
        $("#year").change(function(){
            selectedOption = true
            $("#year").attr('class', 'form-control is-valid')
        })
    }

    $("#pictureProfile").on("change", function(){
        readURLProfile(this)
      })
    
      $("#pictureHeader").on("change", function(){
        readURLBackground(this)
      })

    if ($("#btnUpdate").length){
        $("#btnUpdate").click(function(){
            if(validateForm()){
                document.getElementById("form").submit();
            }
        })
    }
});

function sizeNotZero(value,idName){
    if(value == "" || value.length>=49){
        this.document.getElementById(idName).className = "form-control is-invalid"
    }
    else{
        this.document.getElementById(idName).className = "form-control is-valid"
    }
}

function checkStudentNumber(number){
    aux = true
    console.log(number)
    let feedback = this.document.getElementById("studentNumberFeedback")
    axios.get("http://localhost:3001/aux/checkSN/"+$("#studentNumber").val())
      .then(data=>{
        console.log(data.data)
        if(data.data == false){
            $("#studentNumber").attr('class', 'form-control is-valid')
        }
        else{
            if($("#studentNumber").val() == number){
                $("#studentNumber").attr('class', 'form-control is-valid')
            }
            else{
                $("#studentNumber").attr('class', 'form-control is-invalid')
                feedback.innerHTML = "Student number allready registed."
                aux = false
            }
        }
      })
      .catch(erro=>console.log(erro))
    return aux
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
  
  function validateForm() {
    var x, y, i, valid = true;
    x = document.getElementById("form");
    y = x.getElementsByTagName("input");
    for (i = 0; i < y.length; i++) {
      if (y[i].value == "") {
        console.log(y[i].id)
        if(y[i].id != "yearConclusion" || y[i].id != "pictureProfile" || y[i].id == "pictureHeader"){
          y[i].className += " is-invalid";
          valid = false;
        }
      }
      else if(y[i].id == "studentNumber"){
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
    y = x.getElementsByTagName("select");
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
  