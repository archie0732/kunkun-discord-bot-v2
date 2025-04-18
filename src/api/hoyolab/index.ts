import type { GameType } from '@/types/hoyo';

export const autoSign = async (game: GameType, token: string) => {
  const result = {
    Genshin: '未設定',
    Honkai_3: '未設定',
    Star_Rail: '未設定',
    Zenless_Zone_Zero: '未設定',
  };
  if (game.Genshin) {
    result.Genshin = (await httpsPOST(urlDict.Genshin, token));
  }

  if (game.Honkai_3) {
    result.Honkai_3 = (await httpsPOST(urlDict.Honkai_3, token));
  }

  if (game.Star_Rail) {
    result.Star_Rail = (await httpsPOST(urlDict.Star_Rail, token));
  }

  if (game.Zenless_Zone_Zero) {
    result.Zenless_Zone_Zero = (await httpsPOST(urlDict.Zenless_Zone_Zero, token));
  }

  return result;
};

const httpsPOST = async (url: string, token: string, id?: number) => {
  const zzz = id === 1 ? 'x-rpc-signgame' : 'zzz';
  const res = await fetch(url, {
    method: 'POST', headers: { Cookie: token, ...header, zzz },
  });

  const { message } = await res.json() as { message: string };

  // logger.info(token);

  if (!res.ok) {
    return '簽到失敗';
  }
  return message.toLowerCase() === 'ok' ? '✅ 簽到成功' : '💀 ' + message;
};

const urlDict = {
  Genshin: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=zh-tw&act_id=e202102251931481',
  Star_Rail: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=zh-tw&act_id=e202303301540311',
  Honkai_3: 'https://sg-public-api.hoyolab.com/event/mani/sign?lang=zh-tw&act_id=e202110291205111',
  Zenless_Zone_Zero: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign?lang=zh-tw&act_id=e202406031448091',
};

const header = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'x-rpc-app_version': '2.34.1',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'x-rpc-client_type': '4',
  'Referer': 'https://act.hoyolab.com/',
  'Origin': 'https://act.hoyolab.com',
};

// httpsPOST(urlDict.Zenless_Zone_Zero, testToken, 1).then(console.log);

export const resjsonHaveSign = {
  data: null,
  message: '旅行者，你已經簽到過了~',
  retcode: -5003,
};
