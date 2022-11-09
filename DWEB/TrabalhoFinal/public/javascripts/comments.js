$(document).ready(function(){

    $(document).keyup(function(e){
        if(e.target.tagName == "INPUT"){
            if(e.target.value == ""){
                id=e.target.id
                if(id!="search"){
                  $("#"+id).attr('class', 'form-control mt-2 is-invalid')
                  document.getElementById("btn_"+id).hidden = false;
                }
            }
            else{
                id=e.target.id
                if(id!="search"){
                  $("#"+id).attr('class', 'form-control mt-2 is-valid')
                  document.getElementById("btn_"+id).hidden = false;
                } 
            }
        }
    })

    $(document).on("change", function(e){
        if(e.target.tagName == "INPUT" && event.target.type == "file"){
            id=e.target.id
            id=id.split("fl_")
            id = id[1]
            readURLFiles(e.target,id)
        }
    })

})

function validateForm(id){
    var aux = true
    if($("#"+id).val() == "" || $("#"+id).val() >= 249){
        $("#"+id).attr('class', 'form-control input-lg textareaFix is-invalid')
        document.getElementById("btn_"+id).disabled = true;
        aux=false
    }
    return aux
}


function readURLFiles(input,id){
    $( "#pr_"+id ).empty();
    if (input.files.length == 1){
      console.log(input.files[0].size)
      if(input.files[0].size <= 1000000){
        var reader = new FileReader();
        reader.onload = function(e){
          var image = e.target.result;
          if(image.includes("data:image/gif") || image.includes("data:image/png") || image.includes("data:image/jpeg")){
            $("#pr_"+id).append( '<img class="img-fluid mt-2 mb-2 max-height-img", id="imgAdd_'+id+'"/>');
            $('#imgAdd_'+id).attr('src', e.target.result);
            $("#fb_"+id).attr('class', 'form-text text-success');
            $("#fb_"+id).text("Valid photo.")
          }
          else if(image.includes("data:application/pdf")){
            $("#pr_"+id).append('<div class="card"><div class="row no-gutters"><div class="col-3"><img class="img-fluid img-preview" src="/images/pdf.png" alt=""></div><div class="col"><div class="card-block px-2"><h5 class="card-title pt-2" id="dt_'+id+'"></h5></div></div></div></div>');
            $('#dt_'+id).text(input.files[0].name);
            $("#fb_"+id).attr('class', 'form-text text-success');
            $("#fb_"+id).text("Valid file.")
          }
          else if(image.includes("data:application/msword") || image.includes("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document" || image.includes("text/plain"))){
            $("#pr_"+id).append('<div class="card"><div class="row no-gutters"><div class="col-3"><img class="img-fluid img-preview" src="/images/word.png" alt=""></div><div class="col"><div class="card-block px-2"><h5 class="card-title pt-2" id="docTitle"></h5></div></div></div></div>');
            $('#dt_'+id).text(input.files[0].name);
            $("#fb_"+id).attr('class', 'form-text text-success');
            $("#fb_"+id).text("Valid file.")
          }
          else{
            $("#fb_"+id).attr('class', 'form-text text-danger');
            $("#fb_"+id).text("File format is not valid.")
          }
        }
        reader.readAsDataURL(input.files[0]);
      }
      else{
        $("#fb_"+id).attr('class', 'form-text text-danger');
        $("#fb_"+id).text("Your file can't be larger than 1mb.")
      }
    }
    else{
      $("#fb_"+id).attr('class', 'form-text text-danger');
      $("#fb_"+id).text("You can't upload more than one file per input.")
    }
  }