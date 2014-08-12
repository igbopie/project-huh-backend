/**
 * Created by igbopie on 12/08/14.
 */


$(".template_message").focus();

$(".template_message").on("click",checkContent);
$(".template_message").on("tap",checkContent);

function checkContent(){
    var lastValue = $(".template_message").html();
    if(lastValue ==""){
        $(".template_message").html(" ");
    }
}