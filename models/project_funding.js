var mongodb = require('./db');

function Project(name, title, post) {
  this.title = title;
  this.feature_image = feature_image; //url
 this.short_blurb = short_blurb;
this.category = categroy;
this.funding_goal = funding_goal;
this.funding_duration = funding_duration;
this.reward = reward; //should be [{amount: ,title: ,info: , limit: ,},..]
this.video = video; //url

this.description = description;

this.risk_challenges = risk_challenges;

this.author_name = author_name;
this.author_photo = author_photo;
this.author_link = author_link; //should be [], include weibo, wechat, etc. can be parsed by url into icons
this.author_bio = author_bio; //infomations
this.author_location = author_location;

this.author_contact = author_contact;
this.author_email = author_email;
}

//about order
this.email_append = email_append; //when user make a order, this will be send to customer with the confirm email.

//after published
this.update_info = []; //should be [time: ,content:]

//admin
this.is_verified = false;;
this.is_deleted = false;
this.is_good = false;

//auto
this.author_id = author_id; //the _id of user
this.visit_count = 0; //default 0
this.backers_count = 0; //default 0
this.backers = []; //should be user._id
this.current_amount = 0;
this.comments_count = 0;
this.create_at = date;;
this.update_times_count = 0;
this.last_updated_at = date;

var date = new Date();
  var time = {
      date: date,
      year : date.getFullYear(),
      
month : (date.getMonth() + 1),
day : date.getDate(),      
print_day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      print_minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()), 
 }




}
