import APIService from './apiService';

interface NovelProject {
  id: string;
  title: string;
  genre: string;
  premise: string;
  outline: string[];
  chapters: Array<{
    title: string;
    content: string;
    summary: string;
  }>;
  status: 'planning' | 'writing' | 'completed';
  progress: number;
  writingStyle: '一' | '三';
  targetLength: string;
  themes?: string;
}

class NovelWriterService {
  private apiService: APIService;

  constructor(apiService: APIService) {
    this.apiService = apiService;
  }

  async generatePremise(genre: string, themes?: string): Promise<string> {
    const prompt = `你现在是一个${genre}小说作家，要写一个关于${genre}的小说${themes ? `，主题包含${themes}` : ''}，请给出小说标题和简介。

请按以下格式输出：
小说标题：《标题》
简介：详细的故事简介`;

    const response = await this.apiService.generate({
      prompt,
      temperature: 1.0,
      model: 'gemini'
    });

    return response;
  }

  async generateOutline(project: NovelProject): Promise<string[]> {
    const prompt = `你现在是一名${project.genre}小说作家，正在写一本名为《${project.title}》的${project.genre}小说，请根据小说简介写出小说大纲，注意故事情节的连贯性：

小说简介：
${project.premise}

请生成10-15个章节的大纲，每个章节用一行描述，格式如下：
第1部分：章节标题 - 章节内容概述
第2部分：章节标题 - 章节内容概述
...`;

    const response = await this.apiService.generate({
      prompt,
      temperature: 0.8,
      model: 'gemini'
    });

    // Parse the response into an array of chapter outlines
    const lines = response.split('\n').filter(line => line.trim());
    const chapters = lines
      .filter(line => line.includes('部分：'))
      .map(line => line.split('部分：')[1]?.trim())
      .filter(Boolean);

    return chapters;
  }

  async expandChapter(
    project: NovelProject, 
    chapterOutline: string, 
    chapterIndex: number,
    previousSummary?: string,
    entityInfo?: string
  ): Promise<{ content: string; summary: string }> {
    const isFirst = chapterIndex === 0;
    const isLast = chapterIndex === project.outline.length - 1;
    
    let prompt: string;

    if (isFirst) {
      prompt = `作为一名${project.genre}小说作家，你正在写一本名为《${project.title}》的${project.genre}小说开头剧情，请根据开头章节大纲扩写开头剧情：

开头章节大纲：
${chapterOutline}

请以第${project.writingStyle}人称视角扩写，生成2000-3000字的章节内容。`;
    } else if (isLast) {
      prompt = `作为一名${project.genre}小说作家，你需要为小说《${project.title}》收尾，以下内容给出了前章大纲、相应人物或地点的历史信息，以及结尾章节大纲，请为结尾章节扩写故事情节：

前章大纲：
${previousSummary || '无'}

人物或地点的历史信息：
${entityInfo || '无'}

结尾章节大纲：
${chapterOutline}

请以第${project.writingStyle}人称视角扩写，生成2000-3000字的结尾章节内容。`;
    } else {
      prompt = `你现在是一名${project.genre}小说作家，正在写一本名为《${project.title}》的${project.genre}小说，请联系上一章的剧情概要以及相应的人物或地点的历史信息，并根据本章摘要扩写故事情节：

上一章的剧情概要：
${previousSummary || '无'}

人物或地点的历史信息：
${entityInfo || '无'}

本章摘要：
${chapterOutline}

请以第${project.writingStyle}人称视角扩写，生成2000-3000字的章节内容。`;
    }

    const content = await this.apiService.generate({
      prompt,
      temperature: 0.9,
      maxTokens: 4096,
      model: 'gemini'
    });

    // Generate chapter summary
    const summaryPrompt = `请为以下章节内容写一段简单的摘要，尽量涵盖整体剧情：

${content}`;

    const summary = await this.apiService.generate({
      prompt: summaryPrompt,
      temperature: 0.7,
      maxTokens: 500,
      model: 'perplexity'
    });

    return { content, summary };
  }

  async extractEntities(content: string): Promise<{ characters: string[]; locations: string[] }> {
    const prompt = `请提取并简要概括以下内容中出现的主要人物、地点：

${content}

请按以下格式输出：
人物：人物1、人物2、人物3
地点：地点1、地点2、地点3`;

    const response = await this.apiService.generate({
      prompt,
      temperature: 0.5,
      maxTokens: 1000,
      model: 'perplexity'
    });

    const lines = response.split('\n');
    const charactersLine = lines.find(line => line.startsWith('人物：'));
    const locationsLine = lines.find(line => line.startsWith('地点：'));

    const characters = charactersLine 
      ? charactersLine.replace('人物：', '').split('、').map(c => c.trim()).filter(Boolean)
      : [];
    
    const locations = locationsLine
      ? locationsLine.replace('地点：', '').split('、').map(l => l.trim()).filter(Boolean)
      : [];

    return { characters, locations };
  }

  async updateEntityDatabase(
    previousEntities: string,
    newContent: string
  ): Promise<string> {
    const prompt = `之前剧情中出现的主要人物、地点，以及各个人物的身份或者与其他人物关系等重要信息如下表所示：
${previousEntities}

当前剧情内容如下所示：
${newContent}

请提取并简要概括上述当前剧情内容中的主要人物、地点，以及各个人物的身份、与其他人物关系、地点发生事件等重要信息，保留重要身份信息的同时更新上述信息表，并添加新出现的人物、角色或地点的相关信息。请将人物和地点区分开，严格遵从以下格式输出：
人物名｜人物身份、与他人关系等重要信息
地点名｜地点用途、特点等重要信息`;

    return await this.apiService.generate({
      prompt,
      temperature: 0.6,
      maxTokens: 2000,
      model: 'perplexity'
    });
  }
}

export default NovelWriterService;
export type { NovelProject };