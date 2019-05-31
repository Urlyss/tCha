const socket = io();
var sender = "brown";
var me = "";

function scrollToBottom() {
    messages = jQuery('#messages');
    newMessage = messages.children('div').last();

    clientHeight = messages.prop('clientHeight');
    scrollTop = messages.prop('scrollTop');
    scrollHeight = messages.prop('scrollHeight');
    newMessageHeight = newMessage.innerHeight();
    lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
};

function afficherErr(error) {
    modalContent = $('.modal-content > h4').html(error)
    $('.modal').modal('open')
}

function createWeirdId(name) {
    var i = 0;
    numberName = 0
    for (i = 0; i < name.length; i++) {
        numberName += name.charCodeAt(i)
    }
    numberName = numberName % 57
    return numberName
}

socket.on('connect', function () {

    const params = jQuery.deparam(window.location.search);
    me = params.username;
    socket.emit('join', params, function (err) {
        const username = jQuery('#username');
        username.text(me)
        if (err) {
            afficherErr(err)
            setTimeout(() => {
                window.location.href = '/';
            }, 1000)
        } else {
            console.log('No error');
        }
    });
});

socket.on('disconnect', function () {
    console.log('Disconnected from the server');
    window.location.replace('/')
});

socket.on('updateUserList', function (users) {
    (function () {
        jQuery('div > h6').remove()
        jQuery('.chip').remove()
        jQuery('#users > br').remove();
    })()
    div = jQuery("<div></div>")
    $('#menu').addClass('pulse')
    if (users.length > 1) {
        users.forEach(function (user, key) {
            if (user != me) {
                div = jQuery("<div class='chip'></div><br>");
                weirdUId = createWeirdId(user)
                profilePic = '../images/avatar(' + weirdUId + ').png'
                div.append(jQuery("<img src=" + profilePic + ">" + user + "</img>"));
                jQuery('#users').append(div);
            }
        });
    }
    else {
        return div.append($('<h6>No Connected</h6>'));
    }
});

socket.on('newMessage', function (message) {
    sendedTime = moment(message.createdAt).format("H:m:ss")
    if (message.from == me) {
        sender = "blue lighten-1 mine col s12 l12 offset-l7 m12 right"
        style = 'border-top-left-radius: 60px;border-bottom-left-radius: 30px;border-top-right-radius: 95px'
        msg_elts_style = "blue_text"
        av_style = "margin-left: 72%;"
        time_style = 'margin-right: 74%;'
    } else {
        sender = "orange lighten-1 col s12 m12 left"
        style = "border-top-left-radius: 95px;border-bottom-right-radius: 30px;border-top-right-radius: 60px "
        msg_elts_style = "deep-orange-text"
        av_style = ''
        time_style=''
    }
    const template = jQuery('#message-template').html();
    const html = Mustache.render(template, {
        sender: sender,
        text: message.text,
        from: message.from,
        createdAt: sendedTime,
        style: style,
        fromId: createWeirdId(message.from),
        weirdId: createWeirdId(me),
        weirdIdBg: createWeirdId(me)%16,
        msg_elts_style: msg_elts_style,
        av_style : av_style,
        time_style:time_style,
    });

    jQuery('#messages').append(html);
    scrollToBottom();
});

jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();
    if($("input[type='text']").val().length > 0){
     
    const messageTextBox = jQuery('[name=message]');

    socket.emit('createMessage', {
        text: messageTextBox.val()
    }, function () {
        messageTextBox.val('')
    });   
    }
    else{

    }
});

jQuery('#logout').on('click', function (e) {
    e.preventDefault();

    socket.emit('disconnect');
})

$(document).ready(function () {
    $('.modal').modal(
            {
                opacity:0
            }
    )

    $('.sidenav').sidenav()
    $('#menu').on('click', function () {
        $('#menu').removeClass('pulse')
    })

    $('#emoji').on('click',(e)=>{
        e.preventDefault()
        emojiName = $(e.target)
        $("input[name='message']").val( $("input[name='message']").val()+emojiName.text()+"")
        $('.submit').removeClass('disabled')
    })

    $('body').on('click', function () {
        $('.lu').text('done_all')
        if($('modal').isOpen){
            $('.modal').modal('close')
        }
    })
    var emojiList = $.getJSON( "../js/libs/emoji.json", function() {
        
      })
        .done(function() {
            listeEmoji = $('ul#emoji')
            for(emoji in emojiList.responseJSON){
                listeEmoji.append("<a href='#' id='emoji' class='collection-item  waves-effect waves-light' style='margin-right:5px'>"+emojiList.responseJSON[emoji]+"</a>")
            }
        })
});
