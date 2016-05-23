
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// 应首先应定义div#commit-alert
// option: success, info, warning, danger
var toggleCommitAlert = function (option, html) {
    // just use <a> but I can change it into right color
    html.replace('<a', '<a class=\"alert-link\" ');
    $('#commit-alert')
        .hide()
        .html("<div class=\"alert alert-"
        + option
        + " alert-dismissible fade in \" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;"
        + "</span></button>"
        + html)
        .slideToggle(300);
    location.assign('#commit-alert');
}
var ajaxCommit = function () {

    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function (e) {
        if (xhr.responseText.trim().toLowerCase() === 'ok') {

            toggleCommitAlert('success', '<b>OK! </b>已提交审核, 请耐心等待。可以前往');

        } else if (xhr.responseText.trim().toLowerCase() === 'err') {
            toggleCommitAlert('warning', '<b>咦? </b>服务器不能正确解析您的信息，请备份内容，刷新界面重新填写。十分抱歉。');
        }
        // location.assign('/');
    })

    xhr.addEventListener('error', function (event) {
        // alert('Oups! Something goes wrong.');
        toggleCommitAlert('danger', '<b>出错了！</b>提交失败，请检查您的网络链接。');
    });

    // original form 
    var form = $('#start-form').get(0);
    // 注意formData是只写的，无法读取。
    var fd = new FormData(form);


    // 无需手动
    // var fd = new FormData();

    // var json = {};

    // $('#start-form :input[type!=file]').map(function () {
    //     if (this.name != "" && this.type !== "radio" || this.checked) {
    //         json[this.name] = this.value;
    //     }
    // });

    // // for test
    // // fd.append('name?', 'value?');
    // var tmp;
    // for (tmp in json) {
    //     fd.append(tmp, json[tmp]);
    // }


    var rewardItems = {};
    var num = 0;

    $('.reward-item-details').each(function () {

        var oneItem = {}; // will be convert into json 

        // console.log($(this).find('[name=rwcount]').val().trim());
        // console.log($(this).find('[name=rwdetails]').val().trim());
        // console.log($(this).find('[name=rwdate]').val().trim());
        // console.log($(this).find('[name=rwlimited]').val().trim());

        oneItem.rwcount = $(this).find('[name=rwcount]').val().trim();
        oneItem.rwdetails = $(this).find('[name=rwdetails]').val().trim();
        oneItem.rwdate = $(this).find('[name=rwdate]').val().trim();

        if ($(this).find('[name=rwlimited]').prop('checked') === false) {
            oneItem.rwlimited = 0; // for unlimited
        } else {
            oneItem.rwlimited = $(this).find('[name=rwlimitnum]').val().trim();
        }

        rewardItems[num] = oneItem;
        // all you need is JSON.parse()

        num++;
    });

    fd.append('rewards', JSON.stringify(rewardItems));

    xhr.open('POST', '/start');
    xhr.send(fd);

};


var ajaxMakeOrder = function () {
    $('#pay-button').prop('disabled', true).text('正在处理...');

    toggleCommitAlert('info', '<img src=\'/images/wait.gif\' style=\'width:4em; height:2.2em\'> 正在提交...');

    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function (e) {
        if (xhr.responseText.trim().toLowerCase() === 'ok') {
            toggleCommitAlert('success', '<b>OK! </b>支付成功，感谢您的支持！即将跳转回项目页。');
            $('#pay-button').text('已完成');
            setTimeout(function () {
                location.assign('/project-funding/' + getParameterByName('proj_id'));
            }, 3000);
        } else if (xhr.responseText.trim().toLowerCase() === 'err') {
            toggleCommitAlert('warning', '<b>咦? </b>服务器不能正确解析您的信息，请刷新界面重新提交。十分抱歉。');
        }
        // location.assign('/');
    })

    xhr.addEventListener('error', function (event) {
        toggleCommitAlert('danger', '<b>出错了！</b>支付失败，请检查您支付情况和网络链接。');
    });





    // fd.append('note',$('#pay_note').val().trim());
    // xhr.open('POST', '/back/'+ location.search);
    xhr.open('POST', '/back');
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.send(location.search.substring(1) + '&note=' + $('#pay_note').val().trim() + '&payment=alipay');
    // xhr.send("fname=Henry&lname=Ford");

};

var ajaxProjCate = function (category, jq) {

    var jqxhr = $.ajax('/project-by-category?category=' + category, {
        dataType: 'html'
    }).done(function (html) {
        jq.html(html);
        if ($('#list-view-btn').hasClass('active')) {
            listView();
        }
    }).fail(function (xhr, status) {
        console.log(xhr.status + " " + status);
    }).always(function () {
        // 
    })
}

// 多关键字搜索没问题！
var search = function (word, jq) {

    var url = '/search?word=';

    // safari 不支持箭头函数！！！！
    // word.split(/\s+/).forEach((w) => { url += w + "+"; });
    word.split(/\s+/).forEach(function (w) {
        url += w + "+";
    });

    url = url.substring(0, url.length - 1); // 去掉尾巴的 '+'

    var jqxhr = $.ajax(url, {
        dataType: 'html'
    }).done(function (html) {
        jq.html(html);
    }).fail(function (xhr, status) {
        console.log(xhr.status + " " + status);
    }).always(function () {
        // 
    })
}

// 获取json格式的order
var getJSONorders = function (proj_id, jq) {
    url = '/project-orders?proj_id=' + proj_id;
    var jqxhr = $.ajax(url, {
        dataType: 'json'
    }).done(function (json) {
        var orders = JSON.parse(json);
        jq.get(0).innerHTML = "<h2 id=\"h2\" class=\"project-panel-title\">订单列表</h2>"
            + "<div class='table-responsive'>"
            + "<table class='table table-striped table hover'><tr><th>#</th><th>用户ID</th><th>选项</th><th>金额</th><th>支付方式</th><th>状态</th><th>备注</th></tr>";

        orders.forEach(function (order, index) {
            // console.log(index+","+order);

            var tr = document.createElement('tr');
            tr.innerHTML = "<td>" + (index + 1) + "</td>"
                + "<td>" + order.user_id.substring(18) + "</td>"
                + "<td>" + ("#" + order.rw_id + ": " + order.details.substring(0, 5) + "..." + order.details.substring(order.details.length - 5)) + "</td>"
                + "<td> ¥" + order.rw_amout + "</td>"
                + "<td>" + order.payment + "</td>"
                + "<td>" + order.status + "</td>"
                + "<td>" + (order.note || "无") + "</td>";

            jq.find("tbody").append(tr);

        })

    }).fail(function (xhr, status) {
        console.log(xhr.status + " " + status);
    })
}

var getJSONComments = function ($show_comments) {
    proj_id = location.pathname.substring(17);
    url = '/api/get-comments/?proj_id=' + proj_id;
    var jqxhr = $.ajax(url, {
        dataType: 'json'
    }).done(function (json) {
        console.log(json);
        var comments = JSON.parse(json);
        
        // 都载入出来再显示
        // $show_comments.slideToggle();
        // 先删除原来的信息
        $show_comments.html("");
        var DonComment = document.createElement('div');
        DonComment.innerHTML = "<div class='panel panel-default'><div class='panel-heading'><h3 class='panel-title'>Panel title</h3></div><div class='panel-body'>Panel content</div></div>";

        comments.forEach(function (comment, index) {
            var $aComment = $(DonComment).clone();
            $aComment.find('.panel-title').text(comment.user_name);
            $aComment.find('.panel-body').text(comment.content);
            
            $show_comments.append($aComment);
        })
        
        $show_comments.slideDown();

    }).fail(function (xhr, status) {
        console.log(xhr.status + " " + status);
    })
}


var AJAXMakeComment = function ($submit_btn, $show_comments, comment_content, repost_id_para) {

    proj_id = location.pathname.substring(17);
    content = $(comment_content).val().trim();
    repost_id = repost_id_para || "";

    $submit_btn.prop('disabled', true).html('<img src=\'/images/wait.gif\' style=\'width:2.2em; height:1.2em\'> 正在提交   ');

    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function (e) {
        console.log(xhr.responseText.trim());
        text = xhr.responseText.trim()
        json = JSON.parse(text);

        if (json.hasOwnProperty('success')) {
            $submit_btn.prop('disabled', false).text('提交');
            getJSONComments($show_comments);
        } else {
            toggleCommitAlert('warning', '<b>咦? </b>服务器不能正确解析您的信息，请刷新界面重新提交。十分抱歉。');
        }
    });

    xhr.addEventListener('error', function (event) {
        toggleCommitAlert('danger', '<b>出错了！</b>提交失败，请检查您的网络链接。');
    });

    xhr.open('POST', '/api/make-comment');
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // proj_id + content + repost_id
    xhr.send('&proj_id=' + proj_id
        + '&content=' + content
        + '&repost_id=' + repost_id);
}