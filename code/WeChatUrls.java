package com;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Arrays;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

public class WeChatUrls extends Thread {
	private File catFile;
	final static Integer ThreadNum = 1;
	final String ERROR = "ERROR";
	private final static String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36";
	private final static String WORK_FOLDER = "T:\\Developer\\puppeteerTestCase\\newrank_cn_articles";
	private final static String READ_URLS_FOLDER = "T:\\Developer\\puppeteerTestCase\\newrank_cn";

	public WeChatUrls(File cat) {
		this.catFile = cat;
	}

	private String getUrlProxyContent(String url) {
		String body = ERROR;
		try {
			Document doc = Jsoup.connect(url).userAgent(USER_AGENT).get();
			if (doc.select("body") != null) {
				body = doc.select("body").text();
			}
		} catch (IOException e) {
			System.out.println("ERROR URL: " + url);
			e.printStackTrace();
		}

		return body;
	}

	private void write(String content, String fileName) {
		File f = new File(fileName);
		FileWriter fw = null;
		BufferedWriter bw = null;
		try {
			if (!f.exists()) {
				f.getParentFile().mkdirs();
				f.createNewFile();
			}
//			 fw = new FileWriter(f.getAbsoluteFile(), true); // true表示可以追加新内容
			fw = new FileWriter(f.getAbsoluteFile()); // 表示不追加
			bw = new BufferedWriter(fw);
			bw.write(content);
			bw.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void main(String[] args) throws Exception {
		File baseFolder = new File(READ_URLS_FOLDER);
		File[] cataFiles = baseFolder.listFiles();
		ExecutorService service = Executors.newFixedThreadPool(ThreadNum);
		Arrays.asList(cataFiles).stream().forEach(catFile -> {
			if (catFile.isFile() && catFile.getName().startsWith("id")) {
				service.execute(new WeChatUrls(catFile));
			}
		});
		service.shutdown();
	}

	private void process() {
//		Set<String> redoSet = new HashSet<>();
		String catagory = catFile.getName().split("\\.")[0].split("_")[1];
		File urlFolder = new File(READ_URLS_FOLDER + "\\" + catagory);
		File[] urlFiles = urlFolder.listFiles();
		if (urlFiles != null) {
			Arrays.asList(urlFiles).stream().forEach(urlFile -> {
				try {
					BufferedReader reader = new BufferedReader(new FileReader(catFile));
					String wechatId = null;
					int countLatest = 1;
					int countTop = 1;
					while ((wechatId = reader.readLine()) != null) {
						if (urlFile.getName().startsWith(wechatId)) {
							String wechatName = urlFile.getName().split("\\.")[0].split("_")[2];
//							if (urlFile.length() == 0) {
//								redoSet.add("\"" + catagory + "\",\"" + wechatName + "\",\"" + wechatId + "\"");
//							}
							BufferedReader r = new BufferedReader(new FileReader(urlFile));
							String wechatUrl = null;
							while ((wechatUrl = r.readLine()) != null) {
								String writePath = WORK_FOLDER + "\\" + catagory + "\\"
										+ (urlFile.getName().contains("top") ? "top" : "latest") + "\\" + wechatId
										+ "_" + wechatName + "_"
										+ (urlFile.getName().contains("top") ? countTop++ : countLatest++)+".txt";
								String content = getUrlProxyContent(wechatUrl);
								write(content, writePath);
								System.out.println(writePath);
								Thread.sleep(ThreadLocalRandom.current().nextInt(500, 3000));
							}
							r.close();
						}
					}
					reader.close();
				} catch (Exception e) {
					e.printStackTrace();
				}
			});
		}
//		redoSet.stream().forEach(System.out::println);

	}

	@Override
	public void run() {
		process();
	}
}
