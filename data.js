window.TRIP_DATA={
  places:{
    station:{name:'千岛湖站',lng:119.1970,lat:29.6043,x:72,y:78,type:'交通',note:'高铁到站租车/还车点。'},
    hotel:{name:'花田墅湖景度假别墅',lng:119.0204,lat:29.6133,x:39,y:57,type:'住宿',note:'翡翠岛别墅区，需确认6人床位与大车停车。'},
    tianyushan:{name:'天屿山观景台',lng:119.0420,lat:29.6083,x:45,y:52,type:'观景',note:'适合第一天傍晚看湖景，不跑远路。'},
    bridge:{name:'千岛湖大桥',lng:119.0310,lat:29.6280,x:47,y:43,type:'观景/自驾',note:'半环湖主线入口之一，注意停车不要临停在路边。'},
    jinfeng:{name:'金峰/小金山沿湖段',lng:118.9490,lat:29.6320,x:31,y:39,type:'沿湖自驾',note:'湖湾和弯道较多，白天行驶，雨天缩短。'},
    jiangjia:{name:'姜家镇',lng:118.7800,lat:29.6140,x:15,y:52,type:'午饭/补给',note:'西北半环湖中段，适合作为掉头或午饭节点。'},
    lion:{name:'文渊狮城',lng:118.7320,lat:29.6640,x:12,y:31,type:'景点备选',note:'比姜家更远，单司机视状态决定是否去。'},
    beer:{name:'千岛湖啤酒小镇/灯塔',lng:119.0880,lat:29.6000,x:55,y:62,type:'拍照',note:'东南轻松线，停车相对明确。'},
    oxygen:{name:'千岛湖森林氧吧',lng:119.1690,lat:29.5400,x:74,y:69,type:'避暑',note:'7月适合降温散步，但返程不要太晚。'},
    pier:{name:'中心/东南湖区码头',lng:119.0630,lat:29.5960,x:50,y:64,type:'游船',note:'船班以当天售票为准，会占掉半天以上。'},
    drift:{name:'漂流/水上项目区',lng:119.1390,lat:29.5350,x:67,y:73,type:'玩水',note:'漂流后建议直接回别墅休息，不再跑远线。'},
    market:{name:'镇区超市/采购点',lng:119.0480,lat:29.6080,x:47,y:57,type:'补给',note:'第一天采购水、零食和次日车上用品。'}
  },
  plans:{
    A:{title:'方案A：新手稳妥度假版',tag:'最稳，司机压力最低',desc:'第一天适应车，第二天短半环湖，第三天东南轻松线，第四天还车返沪。适合把风险压到最低。',days:[
      {title:'D1 取车入住 + 别墅休整',route:['station','market','hotel','tianyushan','hotel'],note:'不跑长线，熟悉揽境油门、刹车、车长和倒车影像。'},
      {title:'D2 千岛湖大桥 + 金峰短半环湖',route:['hotel','bridge','jinfeng','hotel'],note:'只体验核心湖边路，不把姜家/芹川设为刚性目标。'},
      {title:'D3 啤酒小镇 + 森林氧吧',route:['hotel','beer','oxygen','hotel'],note:'轻松拍照和避暑，给唯一司机恢复。'},
      {title:'D4 退房 + 还车返沪',route:['hotel','station'],note:'13:10 左右出发去高铁站，14:30 前完成还车。'}]},
    B:{title:'方案B：西北半环湖经典版',tag:'自驾感最强',desc:'把主自驾体验集中到 D2：千岛湖大桥、金峰/小金山、姜家镇，状态好再延伸文渊狮城。',days:[
      {title:'D1 取车 + 入住 + 采购',route:['station','market','hotel'],note:'晚上以别墅活动为主，不夜开湖边路。'},
      {title:'D2 西北半环湖主线',route:['hotel','bridge','jinfeng','jiangjia','lion','hotel'],note:'文渊狮城为状态良好时的延伸点；雨天取消延伸。'},
      {title:'D3 码头/啤酒小镇轻松线',route:['hotel','pier','beer','hotel'],note:'减少驾驶时间，转为坐船或拍照。'},
      {title:'D4 午饭后还车返程',route:['hotel','station'],note:'不临时增加远景点。'}]},
    C:{title:'方案C：夏日玩水游船版',tag:'7月体验更舒服',desc:'少开山路，多用游船、漂流、水上项目和别墅休整承接夏季高温，适合不想长时间坐车的6人组。',days:[
      {title:'D1 高铁取车 + 入住',route:['station','market','hotel'],note:'采购补给，检查停车位和别墅区内部道路。'},
      {title:'D2 游船半日 + 天屿山日落',route:['hotel','pier','tianyushan','hotel'],note:'船班以当天为准；傍晚近距离看景，不跑远。'},
      {title:'D3 漂流/玩水 + 啤酒小镇',route:['hotel','drift','beer','hotel'],note:'漂流后尽快回别墅洗澡休息，避免疲劳驾驶。'},
      {title:'D4 退房还车',route:['hotel','station'],note:'15:51 高铁，时间冗余优先。'}]}
  }
};