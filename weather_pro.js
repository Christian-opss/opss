/*
可以自由定制显示的天气脚本,想怎样都随你,轻松修改轻松查看
https://github.com/sazs34/TaskConfig/blob/master/assets/weather_pro.md
 */
let config = {
    darksky_api: "7b6312f5dff188148367c4ba50c89f88", //从https://darksky.net/dev/ 上申请key填入即可
    aqicn_api: "273ef3cefc2a31591f51c0a4333a6073c09a1338", //从http://aqicn.org/data-platform/token/#/ 上申请key填入即可
    huweather_apiKey: "cb689c296b174f2aa4e38770f5c557f0", //和风天气APIkey,可自行前往 https://dev.heweather.com/ 进行获取
    lat_lon: "23.097158, 113.470545", //请填写经纬度,直接从谷歌地图中获取即可
    lang: "zh", //语言,随意切换为您想要的语言哦(zh/zh-tw/ja/en/fr/...)
    log: 0, //调试日志,0为不开启,1为开启,2为开启精简日志
    timeout: 0, //超时时间,单位毫秒(1000毫秒=1秒),一般不推荐修改[为0则不限制超时时间]
    show: {
        //普通每天的
        template: {
            title: `[天气日报]$[city]$[district] $[summary]`,
            subtitle: `$[weatherIcon]$[weather] $[temperatureMin] ~ $[temperatureMax]°C ☔️降雨概率 $[precipProbability]%`,
            detail: `🥵空气质量 $[aqi]($[aqiDesc]) 🍃风速$[windSpeed]km/h $[windDir]
🌞紫外线指数 $[uv]($[uvDesc]) 💧湿度$[currentHumidity]%
🌡体感温度 $[apparentTemperatureMin] ~ $[apparentTemperatureMax]°C 💨气压$[atmosphere]pa

[生活指数]
$[lifeStyle($[icon][$[brf]]$[txt])]`

[天气周报]
$[daily($[month]月$[day]日  $[temperatureLow]~$[temperatureHigh]°C  $[weatherIcon]$[weather])]`
        },
        lifestyle: { //此处用于显示各项生活指数，可自行调整顺序，顺序越在前面则显示也会靠前，如果您不想查看某一指数，置为false即可，想看置为true即可
            drsg: true, //穿衣指数,
            flu: true, //感冒指数,
            comf: true, //舒适度指数,
            cw: false, //洗车指数,
            sport: false, //运动指数,
            trav: false, //旅游指数,
            uv: false, //紫外线指数,
            air: false, //空气污染扩散条件指数,
            ac: false, //空调开启指数,
            ag: false, //过敏指数,
            gl: false, //太阳镜指数,
            mu: false, //化妆指数,
            airc: false, //晾晒指数,
            ptfc: false, //交通指数,
            fsh: false, //钓鱼指数,
            spi: false, //防晒指数
        }
    }
}

const provider = {
    heweather_now: {
        api: `https://free-api.heweather.net/s6/weather/now?location=${config.lat_lon.replace(/\s/g, "").replace("，", ",")}&key=${config.huweather_apiKey}`,
        progress: 0, //处理进度:0需处理1已处理2无需处理9报错
        timeoutNumber: 0, //超时处理编号
        data: {
            basic: {},
            now: {}
        },
        support: ['$[province]', '$[city]', '$[district]', '$[weatherIcon]', '$[weather]', '$[currentTemperature]', '$[currentWindSpeed]', '$[currentWindDir]', '$[currentWindPower]', '$[currentHumidity]', '$[currentAtmosphere]', '$[currentVisibility]']
    },
    heweather_daily: {
        api: `https://free-api.heweather.net/s6/weather/forecast?location=${config.lat_lon.replace(/\s/g, "").replace("，", ",")}&key=${config.huweather_apiKey}`,
        progress: 0,
        timeoutNumber: 0,
        data: {},
        support: ['$[temperatureMin]', '$[temperatureMax]', '$[precipProbability]', '$[windSpeed]', '$[windDir]', '$[windPower]', '$[humidity]', '$[atmosphere]', '$[visibility]', '$[uv]', '$[uvDesc]', '$[sunrise]', '$[sunset]', '$[moonrise]', '$[moonset]']
    },
    heweather_air: {
        api: `https://free-api.heweather.net/s6/air/now?location=auto_ip&key=${config.huweather_apiKey}`,
        progress: 0,
        timeoutNumber: 0,
        data: {},
        support: []
    },
    heweather_lifestyle: {
        api: `https://free-api.heweather.net/s6/weather/lifestyle?location=${config.lat_lon.replace(/\s/g, "").replace("，", ",")}&key=${config.huweather_apiKey}`,
        progress: 0,
        timeoutNumber: 0,
        data: [],
        support: ['$[lifeStyle]']
    },
    darksky: {
        api: `https://api.darksky.net/forecast/${config.darksky_api}/${config.lat_lon.replace(/\s/g, "").replace("，", ",")}?lang=${config.lang}&units=si`,
        progress: 0,
        timeoutNumber: 0,
        data: {
            daily: {
                data: []
            },
            hourly: {
                data: []
            },
            currently: {}
        },
        support: ['$[summary]', '$[weeklySummary]', '$[weatherIcon]', '$[weather]', '$[temperatureMin]', '$[temperatureMax]', '$[apparentTemperatureMin]', '$[apparentTemperatureMax]', '$[precipProbability]', '$[uv]', '$[uvDesc]']
    },
    aqicn: {
        api: `https://api.waqi.info/feed/geo:${config.lat_lon.replace(/\s/g, "").replace("，", ",").replace(/,/, ";")}/?token=${config.aqicn_api}`,
        progress: 0,
        data: {},
        support: ['$[aqiIcon]', '$[aqi]', '$[aqiDesc]', '$[aqiWarning]']
    }
}
// #region 天气数据获取
function weather() {
    support();
    heweatherNow();
    heweatherDaily();
    darksky();
    aqicn();
    heweatherLifestyle();
}
//clear-day, partly-cloudy-day, cloudy, clear-night, rain, snow, sleet, wind, fog, or partly-cloudy-night
//☀️🌤⛅️🌥☁️🌦🌧⛈🌩🌨❄️💧💦🌫☔️☂️ ☃️⛄️
function darksky() {
    if (provider.darksky.progress == 2) return;
    start("darksky");
    $task.fetch({
        url: provider.darksky.api
    }).then(response => {
        try {
            let darkObj = JSON.parse(response.body);
            record(`天气数据获取-A1-${response.body}`);
            if (darkObj.error) {
                $notify("DarkApi", "出错啦", darkObj.error);
            }
            provider.darksky.data.daily = darkObj.daily;
            provider.darksky.data.hourly = darkObj.hourly;
            provider.darksky.data.currently = darkObj.currently;
            record(`天气数据获取-A2`);
            check('darksky', true)
        } catch (e) {
            console.log(`天气数据A获取报错${JSON.stringify(e)}`)
        }
    }, reason => {
        record(`天气数据获取-A3-${reason.error}`);
        check('darksky', false);
    });
}

function aqicn() {
    if (provider.aqicn.progress == 2) return;
    start("aqicn");
    $task.fetch({
        url: provider.aqicn.api
    }).then(response => {
        try {
            var waqiObj = JSON.parse(response.body);
            if (waqiObj.status == 'error') {
                $notify("Aqicn", "出错啦", waqiObj.data);
            } else {
                record(`天气数据获取-B1-${response.body}`);
                provider.aqicn.data = {
                    ...getAqiInfo(waqiObj.data.aqi)
                };
            }
            check('aqicn', true)
        } catch (e) {
            console.log(`天气数据B获取报错${JSON.stringify(e)}`)
        }
    }, reason => {
        record(`天气数据获取-B2-${reason.error}`);
        //获取精确数据失败后，直接获取粗略信息即可
        heweatherAir();
    });
}

function heweatherNow() {
    start("heweather_now");
    $task.fetch({
        url: provider.heweather_now.api
    }).then(response => {
        try {
            record(`天气数据获取-C1-${response.body}`);
            var heObj = JSON.parse(response.body);
            provider.heweather_now.data.basic = heObj.HeWeather6[0].basic;
            provider.heweather_now.data.now = heObj.HeWeather6[0].now;
            check('heweather_now', true)
        } catch (e) {
            console.log(`天气数据C获取报错${JSON.stringify(e)}`)
        }
    }, reason => {
        record(`天气数据获取-C2-${reason.error}`);
        //因为此接口出错率还挺高的,所以即使报错我们也不处理,该返回什么就返回什么好了
        check('heweather_now', false)
    })
}

function heweatherDaily() {
    if (provider.heweather_daily.progress == 2) return;
    start("heweather_daily");
    $task.fetch({
        url: provider.heweather_daily.api
    }).then(response => {
        try {
            record(`天气数据获取-D1-${response.body}`);
            var heObj = JSON.parse(response.body);
            provider.heweather_daily.data = heObj.HeWeather6[0].daily_forecast[0];
            check('heweather_daily', true)
        } catch (e) {
            console.log(`天气数据D获取报错${JSON.stringify(e)}`)
        }
    }, reason => {
        record(`天气数据获取-D2-${reason.error}`);
        //因为此接口出错率还挺高的,所以即使报错我们也不处理,该返回什么就返回什么好了
        check('heweather_daily', false)
    })
}

function heweatherAir() {
    if (provider.heweather_air.progress == 2) return;
    start("heweather_air");
    $task.fetch({
        url: provider.heweather_air.api
    }).then(response => {
        try {
            record(`天气数据获取F1-${response.body}`);
            var heObj = JSON.parse(response.body);
            provider.heweather_air.data = {
                ...getAqiInfo(heObj.HeWeather6[0].air_now_city.aqi)
            };
            check('heweather_air', true)
        } catch (e) {
            console.log(`天气数据F获取报错${JSON.stringify(e)}`)
        }
    }, reason => {
        record(`天气数据获取-F2-${reason.error}`);
        //因为此接口出错率还挺高的,所以即使报错我们也不处理,该返回什么就返回什么好了
        check('heweather_air', false)
    })
}

function heweatherLifestyle() {
    if (provider.heweather_lifestyle.progress == 2) return;
    start("heweather_lifestyle");
    var needRequest = false;
    //判断一下是否全部都是false,全false的话,则不需要请求此接口直接返回渲染的数据了
    for (var item in config.show.lifestyle) {
        if (config.show.lifestyle[item]) {
            needRequest = true;
            break;
        }
    }
    if (needRequest) {
        $task.fetch({
            url: provider.heweather_lifestyle.api
        }).then(response => {
            try {
                record(`天气数据获取-E1-${response.body}`);
                var heObj = JSON.parse(response.body);
                provider.heweather_lifestyle.data = heObj.HeWeather6[0].lifestyle;
                check('heweather_lifestyle', true)
            } catch (e) {
                console.log(`天气数据E获取报错${JSON.stringify(e)}`)
            }
        }, reason => {
            record(`天气数据获取-E2-${reason.error}`);
            //因为此接口出错率还挺高的,所以即使报错我们也不处理,该返回什么就返回什么好了
            check('heweather_lifestyle', false)
        })
    } else {
        check('heweather_lifestyle', false)
    }
}
//#endregion

// #region 提醒数据组装
function check(type, result) {
    record(`check-${type}-${result}`);
    //支持setTimeout居然不支持clearTimeout,有点难受
    if (provider[type].progress == 1 || provider[type].progress == 9) return;
    provider[type].progress = result ? 1 : 9;
    var isAllChecked = provider.heweather_now.progress != 0 && provider.heweather_daily.progress && provider.darksky.progress != 0 && (provider.aqicn.progress != 0 || provider.heweather_air.progress != 0) && provider.heweather_lifestyle.progress != 0;
    if (isAllChecked) {
        record(`天气数据渲染中[template]`);
        try {
            renderTemplate();
        } catch (e) {
            record(`天气渲染出错-${JSON.stringify(e)}`);
        }
    }
}

var lineBreak = `
`;

function renderTemplate() {
    execArrayTemplate();
    const map = {
        //省
        province: provider.heweather_now.data.basic.admin_area,
        //市
        city: provider.heweather_now.data.basic.parent_city,
        //区
        district: provider.heweather_now.data.basic.location || "UNKNOW",
        //全天气候变化概述
        summary: `${provider.darksky.data.hourly.summary||""}`,
        //一周气候变化概述
        weeklySummary: `${provider.darksky.data.daily.summary||""}`,
        //天气图标
        weatherIcon: `${getHeweatherIcon(provider.heweather_now.data.now.cond_code)||getDarkskyWeatherIcon(provider.darksky.data.hourly.icon)}`,
        //天气描述(晴/雨/雪等)
        weather: `${provider.heweather_now.data.now.cond_txt||getDarkskyWeatherDesc(provider.darksky.data.hourly.icon)}`,
        //当前温度
        currentTemperature: `${provider.heweather_now.data.now.tmp}`,
        //温度最低值
        temperatureMin: `${Math.round(provider.heweather_daily.data.tmp_min||provider.darksky.data.daily.data.get(0).temperatureMin)}`,
        //温度最高值
        temperatureMax: `${Math.round(provider.heweather_daily.data.tmp_max||provider.darksky.data.daily.data.get(0).temperatureMax)}`,
        //体感温度最低值
        apparentTemperatureMin: `${Math.round(provider.darksky.data.daily.data.get(0).apparentTemperatureLow)}`,
        //体感温度最高值
        apparentTemperatureMax: `${Math.round(provider.darksky.data.daily.data.get(0).apparentTemperatureHigh)}`,
        //降雨概率
        precipProbability: `${provider.heweather_daily.data.pop||(Number(provider.darksky.data.daily.data.get(0).precipProbability) * 100).toFixed(0)}`,
        //空气质量图标
        aqiIcon: `${provider.aqicn.data.aqiIcon||provider.heweather_air.data.aqiIcon}`,
        //空气质量
        aqi: `${provider.aqicn.data.aqi||provider.heweather_air.data.aqi}`,
        //空气质量描述
        aqiDesc: `${provider.aqicn.data.aqiDesc||provider.heweather_air.data.aqiDesc}`,
        //空气质量警告(提示)
        aqiWarning: `${provider.aqicn.data.aqiWarning||provider.heweather_air.data.aqiWarning}`,
        //全天风速
        windSpeed: `${provider.heweather_daily.data.wind_spd}`,
        //当前风速
        currentWindSpeed: `${provider.heweather_now.data.now.wind_spd}`,
        //全天风向
        windDir: `${provider.heweather_daily.data.wind_dir}`,
        //当前风向
        currentWindDir: `${provider.heweather_now.data.now.wind_dir}`,
        //全天风力
        windPower: `${provider.heweather_daily.data.wind_sc}`,
        //当前风力
        currentWindPower: `${provider.heweather_now.data.now.wind_sc}`,
        //全天相对湿度
        humidity: `${provider.heweather_daily.data.hum}`,
        //当前相对湿度
        currentHumidity: `${provider.heweather_now.data.now.hum}`,
        //全天大气压
        atmosphere: `${provider.heweather_daily.data.pres}`,
        //当前大气压
        currentAtmosphere: `${provider.heweather_now.data.now.pres}`,
        //全天能见度
        visibility: `${provider.heweather_daily.data.vis}`,
        //当前能见度
        currentVisibility: `${provider.heweather_now.data.now.vis}`,
        //紫外线等级
        uv: `${provider.heweather_daily.data.uv_index||provider.darksky.data.daily.data.get(0).uvIndex}`,
        //紫外线描述
        uvDesc: `${getUVDesc(provider.heweather_daily.data.uv_index||provider.darksky.data.daily.data.get(0).uvIndex)}`,
        //日出时间
        sunrise: `${provider.heweather_daily.data.sr}`,
        //日落时间
        sunset: `${provider.heweather_daily.data.ss}`,
        //月出时间
        moonrise: `${provider.heweather_daily.data.mr}`,
        //月落时间
        moonset: `${provider.heweather_daily.data.ms}`,
    }
    var notifyInfo = {
        title: execTemplate(config.show.template.title, map),
        subtitle: execTemplate(config.show.template.subtitle, map),
        detail: execTemplate(config.show.template.detail, map),
    };
    $notify(notifyInfo.title, notifyInfo.subtitle, notifyInfo.detail);
    $done({});
}
// #endregion

// #region 数据处理方法
function getHeweatherIcon(code) {
    var codeMap = {
        _100: '☀️',
        _101: '☁️',
        _102: '☁️',
        _103: '⛅️',
        _104: '☁️',
        _200: '💨',
        _201: '🌬',
        _202: '🌬',
        _203: '🌬',
        _204: '🌬',
        _205: '🌬',
        _206: '💨',
        _207: '💨',
        _208: '💨',
        _209: '🌪',
        _210: '🌪',
        _211: '🌪',
        _212: '🌪',
        _213: '🌪',
        _300: '🌨',
        _301: '🌨',
        _302: '⛈',
        _303: '⛈',
        _304: '⛈',
        _305: '💧',
        _306: '💦',
        _307: '🌧',
        _308: '🌧',
        _309: '☔️',
        _310: '🌧',
        _311: '🌧',
        _312: '🌧',
        _313: '🌧❄️',
        _314: '💧',
        _315: '💦',
        _316: '🌧',
        _317: '🌧',
        _318: '🌧',
        _399: '🌧',
        _400: '🌨',
        _401: '🌨',
        _402: '☃️',
        _403: '❄️',
        _404: '🌨',
        _405: '🌨',
        _406: '🌨',
        _407: '🌨',
        _408: '🌨',
        _409: '🌨',
        _410: '❄️',
        _499: '⛄️',
        _500: '🌫',
        _501: '🌫',
        _502: '🌫',
        _503: '🌫',
        _504: '🌫',
        _505: '🌫',
        _506: '🌫',
        _507: '🌫',
        _508: '🌫',
        _509: '🌫',
        _510: '🌫',
        _511: '🌫',
        _512: '🌫',
        _513: '🌫',
        _514: '🌫',
        _515: '🌫',
        _900: '🔥',
        _901: '⛄️',
        _999: '❓',
    }
    return codeMap[`_${code}`] ? codeMap[`_${code}`] : "";
}

function getDarkskyWeatherIcon(icon_text) {
    let icon = "❓"
    if (icon_text == "clear-day") icon = "☀️";
    if (icon_text == "partly-cloudy-day") icon = "🌤";
    if (icon_text == "cloudy") icon = "☁️";
    if (icon_text == "rain") icon = "🌧";
    if (icon_text == "snow") icon = "☃️";
    if (icon_text == "sleet") icon = "🌨";
    if (icon_text == "wind") "🌬";
    if (icon_text == "fog") icon = "🌫";
    if (icon_text == "partly-cloudy-night") icon = "🌑";
    if (icon_text == "clear-night") icon = "🌑";
    return icon;
}

function getDarkskyWeatherDesc(icon_text) {
    let icon = "未知"
    if (icon_text == "clear-day") icon = `晴`;
    if (icon_text == "partly-cloudy-day") icon = `晴转多云`;
    if (icon_text == "cloudy") icon = `多云`;
    if (icon_text == "rain") icon = `雨`;
    if (icon_text == "snow") icon = `雪`;
    if (icon_text == "sleet") icon = `雨夹雪`;
    if (icon_text == "wind") icon = `大风`;
    if (icon_text == "fog") icon = `大雾`;
    if (icon_text == "partly-cloudy-night") icon = `多云`;
    if (icon_text == "clear-night") icon = `晴`;
    return icon;
}

function getCityInfo(name) {
    var loc;
    try {
        var locArr = name.split(/[(),，（）]/)
        if (locArr.length >= 4) {
            loc = locArr[2] + " ";
        } else if (locArr.length >= 2) {
            loc = locArr[1] + " ";
        } else {
            loc = ""; //此时会很长,还不如不显示了
        }
    } catch (e) {
        loc = '';
        record(`获取城市名称失败-${JSON.stringify(e)}`);
    }
    return loc;
}

function getAqiInfo(aqi) {
    var aqiDesc = "";
    var aqiIcon = "";
    var aqiWarning = "";
    if (aqi > 300) {
        aqiIcon = `🟤`;
        aqiDesc = `严重污染`;
        aqiWarning = "儿童、老人、呼吸系统等疾病患者及一般人群停止户外活动";
    } else if (aqi > 200) {
        aqiIcon = `🟣`;
        aqiDesc = `重度污染`;
        aqiWarning = "儿童、老人、呼吸系统等疾病患者及一般人群停止或减少户外运动";
    } else if (aqi > 150) {
        aqiIcon = `🔴`;
        aqiDesc = `中度污染`;
        aqiWarning = "儿童、老人、呼吸系统等疾病患者及一般人群减少户外活动";
    } else if (aqi > 100) {
        aqiIcon = `🟠`;
        aqiDesc = `轻度污染`;
        aqiWarning = "老人、儿童、呼吸系统等疾病患者减少长时间、高强度的户外活动";
    } else if (aqi > 50) {
        aqiIcon = `🟡`;
        aqiDesc = `良好`;
        aqiWarning = "极少数敏感人群应减少户外活动";
    } else {
        aqiIcon = `🟢`;
        aqiDesc = `优`;
    }
    return {
        aqi,
        aqiIcon,
        aqiDesc,
        aqiWarning
    };
}

function getUVDesc(daily_uvIndex) {
    var uvDesc = "";
    if (daily_uvIndex >= 10) {
        uvDesc = "五级-特别强";
    } else if (daily_uvIndex >= 7) {
        uvDesc = "四级-很强";
    } else if (daily_uvIndex >= 5) {
        uvDesc = "三级-较强";
    } else if (daily_uvIndex >= 3) {
        uvDesc = "二级-较弱";
    } else {
        uvDesc = "一级-最弱";
    }
    return uvDesc;
}
// #endregion

// #region 模板相关
/**
 * 用于标识该接口已执行,如果有使用超时设置则此操作是有意义的
 * @param {String} type 具体的接口执行类型
 */
function start(type) {
    if (config.timeout > 0) {
        provider[type].timeoutNumber = setTimeout(() => {
            check(type, false);
        }, config.timeout);
    }
}
/**
 * 判断哪些接口需要进行处理,减少网络请求
 */
function support() {
    let regex = /\$\[([a-z,A-Z,0-9]*)\]/g;
    const template = `${config.show.template.title}${config.show.template.subtitle}${config.show.template.detail}`.match(regex);
    provider.heweather_now.progress = template.filter((item, filter) => {
        return provider.heweather_now.support.indexOf(item) != -1;
    }).length > 0 ? 0 : 2;
    provider.heweather_daily.progress = template.filter((item, filter) => {
        return provider.heweather_daily.support.indexOf(item) != -1;
    }).length > 0 ? 0 : 2;
    // provider.heweather_air.progress = template.filter((item, filter) => {
    //     return provider.heweather_air.support.indexOf(item) != -1;
    // }).length > 0 ? 0 : 2;
    provider.heweather_lifestyle.progress = template.filter((item, filter) => {
        let regexLifestyle = /\$\[(lifeStyle\()+([\s\S]+?)(\))+\]/g;
        return regexLifestyle.test(config.show.lifestyle) ? 0 : 2;
    }).length > 0 ? 0 : 2;
    provider.aqicn.progress = template.filter((item, filter) => {
        return provider.aqicn.support.indexOf(item) != -1;
    }).length > 0 ? 0 : 2;
    provider.darksky.progress = template.filter((item, filter) => {
        return provider.darksky.support.indexOf(item) != -1;
    }).length > 0 ? 0 : 2;
    if (provider.darksky.progress == 2) {
        //如果
        let regexDaily = /\$\[(daily\()+([\s\S]+?)(\))+\]/g;
        let regexHourly = /\$\[(hourly\()+([\s\S]+?)(\))+\]/g;
        provider.darksky.progress = (regexDaily.test(config.show.template.detail) || regexHourly.test(config.show.template.detail)) ? 0 : 2;
    }
    record(`h_n:${provider.heweather_now.progress},h_d:${provider.heweather_daily.progress},h_a:${provider.heweather_air.progress},h_l:${provider.heweather_lifestyle.progress},aq:${provider.aqicn.progress},da:${provider.darksky.progress}`)
}
/**
 * 用于普通模板的映射
 * @param {String} template 模板内容
 * @param {Object} map 映射内容
 */
function execTemplate(template, map) {
    if (!template) return "";
    let regex = /\$\[([a-z,A-Z,0-9]*)\]/g;
    if (regex.test(template)) {
        for (item of template.match(regex)) {
            item.match(regex);
            if (RegExp.$1 && map[RegExp.$1]) {
                template = template.replace(item, map[RegExp.$1]);
            } else {
                template = template.replace(item, "");
            }
        }
    }
    return template;
}

function execArrayTemplate() {
    try {
        execTemplateLifestyle();
        execTemplateDaily();
        execTemplateHourly();
    } catch (e) {
        console.log(`${JSON.stringify(e)}`)
    }

}

function execTemplateLifestyle() {
    let regexLifestyle = /\$\[(lifeStyle\()+([\s\S]+?)(\))+\]/g;
    if (provider.heweather_lifestyle.data <= 0) {
        config.show.template.detail.replace(regexLifestyle, '')
    }
    let result = [];
    if (regexLifestyle.test(config.show.template.detail)) {
        let lsMap = { //此处用于显示各项生活指数，可自行调整顺序，顺序越在前面则显示也会靠前，如果您不想查看某一指数，置为false即可，想看置为true即可
            drsg: {
                icon: '👔',
                type: '穿衣指数'
            },
            flu: {
                icon: '🤧',
                type: '感冒指数'
            },
            comf: {
                icon: '😊',
                type: '舒适度指数'
            },
            cw: {
                icon: '🚗',
                type: '洗车指数'
            },
            sport: {
                icon: '🏃🏻',
                type: '运动指数'
            },
            trav: {
                icon: '🌴',
                type: '旅游指数'
            },
            uv: {
                icon: '☂️',
                type: '紫外线指数'
            },
            air: {
                icon: '🌫',
                type: '空气污染扩散条件指数'
            },
            ac: {
                icon: '❄️',
                type: '空调开启指数'
            },
            ag: {
                icon: '😷',
                type: '过敏指数'
            },
            gl: {
                icon: '🕶',
                type: '太阳镜指数'
            },
            mu: {
                icon: '💄',
                type: '化妆指数'
            },
            airc: {
                icon: '🧺',
                type: '晾晒指数'
            },
            ptfc: {
                icon: '🚥',
                type: '交通指数'
            },
            fsh: {
                icon: '🎣',
                type: '钓鱼指数'
            },
            spi: {
                icon: '🔆',
                type: '防晒指数'
            },
        }
        config.show.template.detail.match(regexLifestyle);
        var rangeTemplate = RegExp.$2; //此处拿到的是要替换的列表显示部分了
        let regex = /\$\[([a-z,A-Z,0-9]*)\]/g;
        var template = rangeTemplate.match(regex);
        for (life of provider.heweather_lifestyle.data) {
            if (!config.show.lifestyle[life.type]) continue;
            var singleInfo = rangeTemplate;
            for (item of template) {
                item.match(regex);
                if (RegExp.$1 == "icon") {
                    singleInfo = singleInfo.replace(item, lsMap[life.type].icon)
                } else if (RegExp.$1 == "type") {
                    singleInfo = singleInfo.replace(item, lsMap[life.type].type)
                } else {
                    singleInfo = singleInfo.replace(item, life[RegExp.$1])
                }
            }
            result.push(singleInfo);
        }
        config.show.template.detail = config.show.template.detail.replace(regexLifestyle, result.join(lineBreak));
    }
}

function execTemplateDaily() {
    let regexDaily = /\$\[(daily\()+([\s\S]+?)(\))+\]/g;
    if (provider.darksky.data.daily.data.length <= 0) {
        config.show.template.detail.replace(regexDaily, '')
    }
    let result = [];
    if (regexDaily.test(config.show.template.detail)) {
        config.show.template.detail.match(regexDaily);
        var rangeTemplate = RegExp.$2; //此处拿到的是要替换的列表显示部分了
        let regex = /\$\[([a-z,A-Z,0-9]*)\]/g;
        var template = rangeTemplate.match(regex);
        for (daily of provider.darksky.data.daily.data) {
            var singleInfo = rangeTemplate;
            for (item of template) {
                item.match(regex);
                if (RegExp.$1 == "month") {
                    singleInfo = singleInfo.replace(item, (`${daily["time"]}`).toDateTime().Format("MM"));
                } else if (RegExp.$1 == "day") {
                    singleInfo = singleInfo.replace(item, (`${daily["time"]}`).toDateTime().Format("dd"));
                } else if (RegExp.$1 == "weatherIcon") {
                    singleInfo = singleInfo.replace(item, getDarkskyWeatherIcon(daily.icon));
                } else if (RegExp.$1 == "weather") {
                    singleInfo = singleInfo.replace(item, getDarkskyWeatherDesc(daily.icon));
                } else if (RegExp.$1 == "uvDesc") {
                    singleInfo = singleInfo.replace(item, getUVDesc(daily.uvIndex));
                } else if (RegExp.$1 == "cloudCover") {
                    singleInfo = singleInfo.replace(item, daily.cloudCover * 100);
                } else if (RegExp.$1 == "temperatureHigh") {
                    singleInfo = singleInfo.replace(item, Math.round(daily.temperatureHigh));
                } else if (RegExp.$1 == "temperatureLow") {
                    singleInfo = singleInfo.replace(item, Math.round(daily.temperatureLow));
                } else if (RegExp.$1 == "apparentTemperatureMax") {
                    singleInfo = singleInfo.replace(item, Math.round(daily.apparentTemperatureMax));
                } else if (RegExp.$1 == "apparentTemperatureMin") {
                    singleInfo = singleInfo.replace(item, Math.round(daily.apparentTemperatureMin));
                } else if (RegExp.$1 && daily[RegExp.$1] != undefined) {
                    singleInfo = singleInfo.replace(item, daily[RegExp.$1]);
                }
            }
            result.push(singleInfo);
        }
        config.show.template.detail = config.show.template.detail.replace(regexDaily, result.join(lineBreak));
    }
}

function execTemplateHourly() {
    let regexHourly = /\$\[(hourly\()+([\s\S]+?)(\))+\]/g;
    if (provider.darksky.data.hourly.data.length <= 0) {
        config.show.template.detail.replace(regexHourly, '')
    }
    let result = [];
    if (regexHourly.test(config.show.template.detail)) {
        config.show.template.detail.match(regexHourly);
        var rangeTemplate = RegExp.$2; //此处拿到的是要替换的列表显示部分了
        let regex = /\$\[([a-z,A-Z,0-9]*)\]/g;
        var template = rangeTemplate.match(regex);
        for (hourly of provider.darksky.data.hourly.data) {
            var singleInfo = rangeTemplate;
            for (item of template) {
                item.match(regex);
                if (RegExp.$1 == "month") {
                    singleInfo = singleInfo.replace(item, (`${hourly["time"]}`).toDateTime().Format("MM"));
                } else if (RegExp.$1 == "day") {
                    singleInfo = singleInfo.replace(item, (`${hourly["time"]}`).toDateTime().Format("dd"));
                } else if (RegExp.$1 == "hour") {
                    singleInfo = singleInfo.replace(item, (`${hourly["time"]}`).toDateTime().Format("hh"));
                } else if (RegExp.$1 == "weatherIcon") {
                    singleInfo = singleInfo.replace(item, getDarkskyWeatherIcon(hourly.icon));
                } else if (RegExp.$1 == "weather") {
                    singleInfo = singleInfo.replace(item, getDarkskyWeatherDesc(hourly.icon));
                } else if (RegExp.$1 == "uvDesc") {
                    singleInfo = singleInfo.replace(item, getUVDesc(hourly.uvIndex));
                } else if (RegExp.$1 == "cloudCover") {
                    singleInfo = singleInfo.replace(item, hourly.cloudCover * 100);
                } else if (RegExp.$1 == "temperature") {
                    singleInfo = singleInfo.replace(item, Math.round(hourly.temperature));
                } else if (RegExp.$1 == "apparentTemperature") {
                    singleInfo = singleInfo.replace(item, Math.round(hourly.apparentTemperature));
                } else if (RegExp.$1 && hourly[RegExp.$1] != undefined) {
                    singleInfo = singleInfo.replace(item, hourly[RegExp.$1]);
                }
            }
            result.push(singleInfo);
        }
        config.show.template.detail = config.show.template.detail.replace(regexHourly, result.join(lineBreak));
    }
}

function record(log) {
    if (config.log == 1) {
        console.log(log);
    } else if (config.log == 2) {
        console.log(log.substring(0, 60));
    }
}
// #endregion

// #region 扩展方法
Array.prototype.get = function (index, defaultValue = {}) {
    if (index >= 0 && this.length > 0 && this.length >= index + 1) {
        return this[index];
    } else {
        return defaultValue;
    }
}
String.prototype.toDateTime = function () {
    var time = parseInt(this + '000');
    return new Date(time);
}
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份   
        "d+": this.getDate(), //日   
        "h+": this.getHours(), //小时   
        "m+": this.getMinutes(), //分   
        "s+": this.getSeconds(), //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds() //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
// #endregion
weather();
