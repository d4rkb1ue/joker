function checkFlash(success, error) {
    if (success || error) {
        alert(success || error);
    }
}

// 应首先应定义div#start-main-container
// option: success, info, warning, danger
var toggleCommitAlert = function(option, html) {
    // just use <a> but I can change it into right color
    html.replace('<a','<a class=\"alert-link\" ')
     $('#commit-alert')
     .hide()
     .html("<div class=\"alert alert-"
     +option
     +" alert-dismissible fade in \" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;"
     +"</span></button>"
     +html)
     .slideToggle(300);
     
}
var ajaxCommit = function () {

    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function (e) {
        if (xhr.responseText.trim().toLowerCase() === 'ok') {
            
            toggleCommitAlert('success','<b>OK! </b>已提交审核, 请耐心等待。可以前往');
            
        }else if(xhr.responseText.trim().toLowerCase() === 'err'){
            toggleCommitAlert('warning','<b>咦? </b>服务器不能正确解析您的信息，请备份内容，刷新界面重新填写。十分抱歉。');
        }
        // location.assign('/');
    })

    xhr.addEventListener('error', function (event) {
        // alert('Oups! Something goes wrong.');
        toggleCommitAlert('danger','<b>出错了！</b>提交失败，请检查您的网络链接。');
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

        if ($(this).find('[name=rwlimited]').prop('checked') === true) {
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
