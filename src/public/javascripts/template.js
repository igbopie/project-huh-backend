/**
 * Created by igbopie on 12/08/14.
 */


$(".template_message").focus();

$(".template_message").on("click", checkContent);
$(".template_message").on("tap", checkContent);

function checkContent() {
  var lastValue = $(".template_message").html();
  if (lastValue == "") {
    $(".template_message").html(" ");
  }
}

var currentId = 2;

function getText() {
  return toRegularText($(".template_message").html());
}

function setText(text) {
  $(".template_message").html(toHtmlText(text));
}

function setTemplateId(templateId) {
  $(".template").removeClass("template" + currentId);

  currentId = templateId;
  $(".template").addClass("template" + currentId);
}

function getTemplateId() {
  return currentId;
}

function toHtmlText(text) {
  return text.replace(/(?:\r\n|\r|\n)/g, '<br />');
}

function toRegularText(html) {
  return html.trim()
    .replace(/<br(\s*)\/*>/ig, '\n') // replace single line-breaks
    .replace(/<[p|div]\s/ig, '\n$0') // add a line break before all div and p tags
    .replace(/(<([^>]+)>)/ig, "");   // remove any remaining tags
}

// div to br
$('div[contenteditable]').keydown(function (e) {
  // trap the return key being pressed
  if (e.keyCode === 13) {
    // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
    document.execCommand('insertHTML', false, '<br><br>');
    // prevent the default behaviour of return key pressed
    return false;
  }
});