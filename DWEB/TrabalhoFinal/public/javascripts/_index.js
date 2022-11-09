$(document).ready(function() {

    if($("#btnSubmit").length){
        document.getElementById("btnSubmit").disabled = true;
        $("#btnFollow").click(function(){
            if(validateForm()){
                document.getElementById("form").submit();
            }
        })
    }

    $("btnSubmit").attr("aria-disabled", true);
    if ($("#text").length){
        $("#text").keyup(function(){
            if($("#text").val() == "" || $("#text").val().length >= 249){
                $("#text").attr('class', 'form-control input-lg textareaFix is-invalid')
                document.getElementById("btnSubmit").disabled = true; 
            }
            else{
                $("#text").attr('class', 'form-control input-lg textareaFix is-valid')
                document.getElementById("btnSubmit").disabled = false; 
            }
        })
    }

    if($("#ogfiles").length){
      $("#ogfiles").on("change", function(){
        readURLFile(this)
      })
    }

});

function readURLFile(input){
    $( "#contentUploaded" ).empty();
    if (input.files.length == 1){
      console.log(input.files[0].size)
      if(input.files[0].size <= 1000000){
        var reader = new FileReader();
        reader.onload = function(e){
          var image = e.target.result;
          console.log(image)
          if(image.includes("data:image/gif") || image.includes("data:image/png") || image.includes("data:image/jpeg")){
            $("#contentUploaded").append( '<img class="img-fluid mt-2 mb-2 max-height-img", id="imgAdd"/>');
            $('#imgAdd').attr('src', e.target.result);
            $("#feedbackFile").attr('class', 'form-text text-success');
            $("#feedbackFile").text("Valid photo.")
          }
          else if(image.includes("data:application/pdf")){
            console.log("here")
            $("#contentUploaded").append('<div class="card"><div class="row no-gutters"><div class="col-3"><img class="img-fluid img-preview" src="/images/pdf.png" alt=""></div><div class="col"><div class="card-block px-2"><h5 class="card-title pt-2" id="docTitle"></h5></div></div></div></div>');
            $('#docTitle').text(input.files[0].name);
            $("#feedbackFile").attr('class', 'form-text text-success');
            $("#feedbackFile").text("Valid photo.")
          }
          else if(image.includes("data:application/msword") || image.includes("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document")){
            $("#contentUploaded").append('<div class="card"><div class="row no-gutters"><div class="col-3"><img class="img-fluid img-preview" src="/images/word.png" alt=""></div><div class="col"><div class="card-block px-2"><h5 class="card-title pt-2" id="docTitle"></h5></div></div></div></div>');
            $('#docTitle').text(input.files[0].name);
            $("#feedbackFile").attr('class', 'form-text text-success');
            $("#feedbackFile").text("Valid photo.")
          }
          else{
            $("#feedbackFile").attr('class', 'form-text text-danger');
            $("#feedbackFile").text("File format is not valid.")
          }
        }
        reader.readAsDataURL(input.files[0]);
      }
      else{
        $("#feedbackFile").attr('class', 'form-text text-danger');
        $("#feedbackFile").text("Your file can't be larger than 1mb.")
      }
    }
    else{
      $("#feedbackFile").attr('class', 'form-text text-danger');
      $("#feedbackFile").text("You can't upload more than one file per input.")
    }
  }

function validateForm(){
    var aux = true
    if($("#text").val() == "" || $("#text").val() >= 249){
        $("#text").attr('class', 'form-control input-lg textareaFix is-invalid')
        document.getElementById("btnSubmit").disabled = true;
        aux=false
    }
    return aux
}