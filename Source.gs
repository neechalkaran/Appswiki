function gettoken(page,dom,user,pass){
var search = "http://" + dom + "/w/api.php?action=login&format=json&lgname=" + user +"&lgpassword=" + pass;
  var options = {"method": "POST"};
  try {
    var login = UrlFetchApp.fetch(search,options); 
    var data = Utilities.jsonParse(login.getContentText());
if (login.getResponseCode() === 200) {
var cook = data.login.cookieprefix;
var options2 = {"method": "POST", "headers": {"cookie":cook+"Session=" + data.login.sessionid + "; path=/; domain=" + dom + "; HttpOnly;" + cook + "UserName=" + user}};
    var lconfirm = UrlFetchApp.fetch(search + "&lgtoken=" + data.login.token ,options2);       
    if (lconfirm.getResponseCode() === 200) 
    {
     var data1 = Utilities.jsonParse(lconfirm.getContentText());
if(data1.login.result=="Success"){
var options3 = {"method": "GET", "headers": {"Content-Type":"application/x-www-form-urlencoded", "cookie":cook + "Session=" + data1.login.sessionid + "; path=/; domain=" + dom + "; HttpOnly;" + cook + "UserName=" + data1.login.lgusername + "; " + cook + "UserID=" + data1.login.lguserid + "; " + cook + "Token="+ data1.login.lgtoken}};
var queryurl = "https://" + dom + "/w/api.php?action=query&format=json&prop=info&intoken=edit&titles=" + page;
var qresult = UrlFetchApp.fetch(queryurl,options3);  
var datai =qresult.getContentText();
var toke  = (datai.split("edittoken")[1]).split("\+")[0];
var token = toke.substring(3,toke.length);
return ["1",token, data1.login.sessionid, data1.login.lguserid,data1.login.cookieprefix];
}
else{ return  ["0", "Unable to get token","",""];}
}   
    }
  } catch (e) { return ["0", " Result:" + e.toString(),"",""];}
}

function writewiki(pa,durl,tex,sum,sec,fil,rtoken) {  
//duplicate of Appswiki Editor
  /*
  sec "replace", "create"-new page "new"-botton append "0"-top append
  summary needs to be blank for other edits
  */
  
 // return tex + " " + sec;
var user=rtoken[0];
var token=rtoken[1];
var session=rtoken[2];
var userid=rtoken[3];
var cook=rtoken[4];
var editurl = "https://" + durl + "/w/api.php?bot";
var msg = "";
if((fil.length>0)||(sum=="")||(sec=="create")){var matter = getcontent(durl, pa);}

if(sec=="create"){
if(matter!="nil"){return pa + " is already exist";}
else{sec="";}
}

if((sum=="")&&((sec=="0")||(sec=="new")))
{
if(matter!="Invalid page")
{
if(matter!="nil")
{if(sec=="new"){tex=matter + "\n" + tex;sec="";}if(sec=="0"){tex= tex + "\n" + matter;sec="";}}
}
else{return pa + " is Invalid";}
}
//return tex;
if((fil.length>0)&&(fil.trim()!=""))
{
var checkdata = enreg(matter);
fil=enreg(fil);
if(checkdata.search(fil)>-1)
{
if(sec!="replace"){return pa + " already has this content";}
if(sec=="replace")
{
var count = parseInt(checkdata.split(fil).length);
var temp=checkdata.replace(RegExp(fil,"gi"),tex);
tex =temp;
sum="";
msg = " sucessfully replaced " + (count - 1) + " time(s)";
sec="";
}
}
else
{if(sec=="replace"){return pa + " doesn't have " + fil;}}// filter found ends
tex=dereg(tex);
} 
var pload = {"action":"edit","format":"json","title": pa,"token": token + "+\\","text":tex,"summary":sum,"section":sec}
var options = 
{
 "method" : "post",
 "headers": {"cookie":cook + "Session=" +  session + "; path=/; domain=" + durl + "; HttpOnly;" + cook + "UserName=" + user + "; " + cook + "UserID=" + userid + "; " + cook + "Token="+  token},
 "payload" : pload
}
try
{
var edit = UrlFetchApp.fetch(editurl,options);
var fresult = Utilities.jsonParse(edit.getContentText());
return fresult.edit.result + msg;
}
catch(e)
{
return "unable to update the page. "+e.toString();
}
}

function getcontent(durl,pa){
try
{
var testurl = "http://" + durl + "/w/index.php?action=raw&title=" + pa;
var data = UrlFetchApp.fetch(testurl).getContentText();
return data;
}
catch(e){
if(e.toString().search("returned code 404")<1){return "Invalid page";}//return invalid page only other than 404 error
else{return "nil";}
}//don't change the  "Invalid page"
}
function enreg(s)
{
 s=s.replace(/\[/gi,"〈");
 s=s.replace(/\]/gi,"〉");
s=s.replace(/\|/gi,"ஂஂ");
return s;
}

function dereg(s)
{
s=s.replace(/〈/gi,"\[");
s=s.replace(/〉/gi,"\]");
s=s.replace(/ஂஂ/gi,"\|");
return s;
}
