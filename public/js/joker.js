function checkFlash(success, error) {
    if (success || error) {
        alert(success || error);
    }
}


var ajaxCommit = function () {

    // to json string 已经完成，接下来就是ajax传表单，然后服务端解析了！
    // https://developer.mozilla.org/zh-CN/docs/Web/Guide/HTML/Forms/Sending_forms_through_JavaScript#.E5.8F.91.E9.80.81.E4.BA.8C.E8.BF.9B.E5.88.B6.E6.95.B0.E6.8D.AE

    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function (e) {
        alert('Yeah! Data sent and response loaded.');
        // location.assign('/');
    })

    xhr.addEventListener('error', function (event) {
        alert('Oups! Something goes wrong.');
    });

    // original form 
    var form = $('#start-form').get(0);
    // 注意formData是只写的，无法读取。
    var fd = new FormData(form);

    
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
