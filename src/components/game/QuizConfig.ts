export interface LangConfig {
    id: string;
    name: string;
    subName: string;
    flag: string;
    path: string;
    storageKey: string;
}

export const QUIZ_LANGS: LangConfig[] = [
    {
        id: 'swedish',
        name: 'Svenska',
        subName: 'スウェーデン語',
        flag: '🇸🇪',
        path: '/data/quiz/swedish.json',
        storageKey: 'quiz_highscore_swedish'
    },
    {
        id: 'ainu',
        name: 'Aynu itak',
        subName: 'アイヌ語',
        flag: '🐻',
        path: '/data/quiz/ainu.json',
        storageKey: 'quiz_highscore_ainu'
    }
];
