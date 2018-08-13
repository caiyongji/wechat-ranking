/**
* load wechat article urls on newrank.cn
**/
const puppeteer = require('puppeteer');
//emulate iphone
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36';
const workPath = './newrank_cn1111';
const fs = require("fs");
const userName = "公众号";
const ppwwdd = "caiyongji";
if (!fs.existsSync(workPath)) {
        fs.mkdirSync(workPath)
}
const loginUrl = 'https://www.newrank.cn/public/login/login.html?back=https%3A//www.newrank.cn/';

const monthlyRankUrl = "https://www.newrank.cn/public/info/list.html?period=month&type=data";

const detailUrl = "https://www.newrank.cn/public/info/detail.html?account=";

(async () => {

    const browser = await puppeteer.launch({headless: false});//set headless: true will hide chromium UI
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
	await page.setViewport({width:1920, height:1000});
    await page.setRequestInterception(true);
	
    //filter to block images
    page.on('request', request => {
    if (request.resourceType() === 'image')
      request.abort();
    else
      request.continue();
    });
    await page.goto(loginUrl);
	//login
	await loginOperate();
	//await page.close();
	
	await processMonthlyRank('.wx-right-type-list-spe a[icon=ss]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=mgs]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=cf]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=kj]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=cy]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=qc]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=ls]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=zc]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=jy]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=xs]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=zw]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=qy]');
	
	await processMonthlyRank('.wx-right-type-list-spe a[icon=wh]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=bk]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=jk]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=shs]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=ms]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=sj]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=lx]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=ym]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=qg]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=ty]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=mt]');
	await processMonthlyRank('.wx-right-type-list-spe a[icon=zs]');
	
	await processMonthlyRank('#wx_month_all');
	
	
	
	
	async function loginOperate(){
		try{
			await page.click('div[data-type=pwd]');
		}catch(err){
			console.log('login#1');
		}
		
		try{
			await page.type('#account_input',userName);
			await page.type('#password_input',ppwwdd);
		}catch(err){
			console.log('login#2');
		}
		
		try{
			await page.click('#pwd_confirm');
		}catch(err){
			console.log('login#3');
		}
	
	}
	
	async function processMonthlyRank(btn){
		const tab = await browser.newPage();
		await tab.setUserAgent(userAgent);
		await tab.setViewport({width:1920, height:1000});
		await tab.setRequestInterception(true);
		
		//filter to block images
		tab.on('request', request => {
		if (request.resourceType() === 'image')
		  request.abort();
		else
		  request.continue();
		});
		await tab.goto(monthlyRankUrl);
		try{
			await tab.click(btn);
		}catch(err){
			console.log('processMonthlyRank#1');
		}
		let fileName = await tab.evaluate(function(param){
			return document.querySelector(param).innerHTML;
		},btn);
		console.log('-------------------------'+fileName+'-------------------------');
		await scrollWait(tab);
		await waitSecond(tab);
		
		const sel = '.wx_main tr';
		const texts = await tab.evaluate((sel) => {
        let elements = Array.from(document.querySelectorAll(sel));
			let txt = elements.map(element => {
				return element.innerText
			})
			return txt;
		}, sel);
		console.log('total rows: '+texts.length);
		let contents='记录条数'+(texts.length-1)+'\n\n';
		texts.forEach(function(c,index){
			if(index>0){
				contents+=c+'\n\n';
			}
		});
		
		const fs = require("fs");
        fs.writeFileSync(workPath+'/'+fileName+'.txt',contents);
        console.log(fileName + " has been extracted to local.");
		
		const idSel = '.wx_main tr a[href^="detail.html"]';
		const ids = await tab.evaluate((idSel) => {
        let elements = Array.from(document.querySelectorAll(idSel));
			let txt = elements.map(element => {
				return element.innerText
			})
			return txt;
		}, idSel);
		let idContents='';
		let w_name;
		let flag =true;
		/*ids.forEach(async function(id,index){
			if(index%2!=0){
				idContents+=id+'\n';
				await getDetail(fileName,w_name,id);
				w_name =null;
			}else{
				w_name=id;
			}
		});*/
		await (async ()=>{
			for(let i=0;i<ids.length;i++){
				if(i%2!=0){
				idContents+=ids[i]+'\n';
				await getDetail(fileName,w_name,ids[i]);
				w_name =null;
			}else{
				w_name=ids[i];
			}
			}
		})();
		let idFile = 'id_'+fileName;
        fs.writeFileSync(workPath+'/'+idFile+'.txt',idContents);
        console.log(idFile + " has been extracted to local.");
		await tab.close();
	}
	
	async function scrollWait(p, n){
		if(n==null) n=5;
		for(let i= 0; i<n;i++){
			try{
				await p.evaluate(()=>window.scrollTo(0, document.body.scrollHeight));
				await p.waitForNavigation({timeout:500,waitUntil: ['networkidle0']});
			}catch(err){
				console.log('scroll to bottom and then wait 500 ms.');
			}
		}
	}
	
	async function waitSecond(p){
		try{
			await p.waitForNavigation({timeout:2000,waitUntil: ['networkidle0']});
		}catch(err){
			//console.log('wait 1 sec.');
		}
	}
	
	async function getDetail(cat,name,id){
		const tab = await browser.newPage();
		await tab.setUserAgent(userAgent);
		await tab.setViewport({width:1920, height:1000});
		await tab.setRequestInterception(true);
		
		//filter to block images
		tab.on('request', request => {
		if (request.resourceType() === 'image')
		  request.abort();
		else
		  request.continue();
		});
		await tab.goto(detailUrl+id);
		await waitSecond(tab);
		const sel = '#info_detail_article_top li .title a';
		const hrefs = await tab.evaluate((sel) => {
			let elements = Array.from(document.querySelectorAll(sel));
			let links = elements.map(element => {
				return element.href
			})
			return links;
		}, sel);
		let urlList='';
		hrefs.forEach(function(href,index){
			urlList+=href+"\n";
		});
		const fs = require("fs");
		if (!fs.existsSync(workPath+'/'+cat)) {
			fs.mkdirSync(workPath+'/'+cat)
		}
        fs.writeFileSync(workPath+'/'+cat+'/'+id+'_top_'+name+'.txt',urlList);
		
		const sel1 = '#info_detail_article_lastest li .title a';
		const hrefs1 = await tab.evaluate((sel1) => {
			let elements = Array.from(document.querySelectorAll(sel1));
			let links = elements.map(element => {
				return element.href
			})
			return links;
		}, sel1);
		let urlList1='';
		hrefs1.forEach(function(href,index){
			urlList1+=href+"\n";
		});
		fs.writeFileSync(workPath+'/'+cat+'/'+id+'_lastest_'+name+'.txt',urlList1);
		console.log(id+' '+name+' has been extracted to local.');
		await tab.close();
	}
	
})();

