var checkTool = {
    checkLogin : function (req, res, next) {
        if (!req.session.user) {
            req.flash('error', '请先登录!');
            res.redirect('/login');
        }
        next();
    },
    checkLogout :
    function (req, res, next) {
        if (req.session.user) {
            res.redirect('back');
        }
        next();
    }
}

// 这个要放在后面！！！！不能放在checkTool的声明前面！！！
module.exports = checkTool;