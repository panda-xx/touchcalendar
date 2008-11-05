#-- Shukujitu.pi

# FROM http://www.h3.dion.ne.jp/~sakatsu/holiday_logic.htm

##_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
##_/
##_/  CopyRight(C) K.Tsunoda(AddinBox) 2001 All Rights Reserved.
##_/  ( http://www.h3.dion.ne.jp/~sakatsu/index.htm )
##_/
##_/  この祝日判定コードは[Excel:kt関数アドイン]で使用している
##_/  ＶＢＡマクロを[Ruby]に移植したものです。
##_/  この関数では、２００７年施行の改正祝日法(昭和の日)までを
##_/  サポートしています(９月の国民の休日を含む)。
##_/
##_/ (1) このコードを引用するに当たっては、必ずこのコメントも
##_/　　　一緒に引用する事とします。
##_/ (2) 他サイト上で本マクロを直接引用する事は、ご遠慮願います。
##_/　　　[ http://www.h3.dion.ne.jp/~sakatsu/holiday_logic.htm ]
##_/　　　へのリンクによる紹介で対応して下さい。
##_/ (3) [ktHolidayName]という関数名そのものは、各自の環境に
##_/　　　おける命名規則に沿って変更しても構いません。
##_/
##_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
##
##      ＶＢＡ以外の言語に移植する場合は､その言語の特性に合わせたベストなコード構成に
##    変更しても構いません。
##
##    また､出来上がったものをご連絡頂ければ､このページにて紹介させて貰います。
##
## 2003-11-03(月) [ruby-list:38743]のご指摘で訂正２ヶ所。thanks Tadayoshi Funaba <tadf@rc5.so-net.ne.jp>
##                昭和の日法案成立用のスクリプトをコメントで不可。今回も不成立だったらしい。
## 2003-09-21(日):…とのことなので imported by take_tk
## 2003-09-21(日) [ap-ext:0128] Shukujitu.rb http://www.freeml.com/message/ap-ext@freeml.com/0000128
##
## 2005-04-14(木) Ruby 組込みクラスの Time クラスを使うもの。1970/1/1 以前はつかえない。
##
## ruby の特徴
## (1) 条件判断では文字列は真、nilは偽の扱いになる。
## (2) returnがない場合には、最後の文の値が戻り値となる。
## (3) 論理演算は短絡評価型。「||」で左がtrueなら右は判断しない、「&&」で左がfalseなら右は判断しない。
##

class Time
  def inc_day(n=1)
    return self + n*24*60*60
  end
end

module Shukujitu

  MONDAY = 1
  TUESDAY = 2
  WEDNESDAY = 3

  def self.shukujitu? date
    kihon_shukujitu?(date) || hurikae_kyujitu?(date)
  end

  D_1973_4_12 = ::Time.local(1973,4,12)
  def self.hurikae_kyujitu? date
    # 月曜以外は振替休日判定不要
    # 5/6(火,水)の判定は[kihon_shukujitu?]で処理済
    # 5/6(月)はここで判定する
    if ( date.wday == MONDAY ) && ( date >= D_1973_4_12 ) && ( kihon_shukujitu? date.inc_day(-1) )
      return '振替休日'
    end
  end

  begin
    D_1948_7_20 = ::Time.local(1948,7,20)
  rescue
    D_1948_7_20 = ::Time.at(0)  # Thu Jan 01 09:00:00 東京 (標準時) 1970
  end
  def self.kihon_shukujitu? date
    return if date < D_1948_7_20  # 祝日法施行前
    year  = date.year
    month = date.month
    day   = date.day
    yobi  = date.wday
    shuu  = ( day - 1 ) / 7 + 1
    case month
    when 1
      return '元日' if day == 1    # 07/5/28 祝日名が'元旦'になっていたのを修正
      if year >= 2000
        return '成人の日' if ( yobi == MONDAY ) && ( shuu == 2 )
      else
        return '成人の日' if ( day == 15 )
      end

    when 2
      case day
      when 11 ; return '建国記念の日'       if year >= 1967
      when 24 ; return '昭和天皇の大喪の礼' if year == 1989
      end

    when 3
      return '春分の日' if day == shunbun_day(year)

    when 4
      case day
      when 29
        case year
        when 2007..9999 ; return '昭和の日'
        when 1989..2006 ; return 'みどりの日'
        else            ; return '天皇誕生日'
        end
      when 10 ; return '皇太子明仁親王の結婚の儀' if year == 1959
      end

    when 5
      case day
      when 3  ; return '憲法記念日'
      when 4
        case year
        when 2007..9999 ; return 'みどりの日'
        when 1986..2006 ; return '国民の休日' if ( yobi > MONDAY )
                # 5/4が日曜日は『只の日曜』､月曜日は『憲法記念日の振替休日』(～2006年)
        end
      when 5  ; return 'こどもの日'
      when 6  ; return '振替休日' if (year >= 2007 ) and ([TUESDAY,WEDNESDAY].include? yobi)
                # '[5/3,5/4が日曜]ケースのみ、ここで判定
      end

    when 6
      return '皇太子徳仁親王の結婚の儀' if (day == 9) && (year == 1993)

    when 7
      if year >= 2003
        return '海の日' if ( shuu == 3) && (yobi == MONDAY)
      elsif year >= 1996
        return '海の日' if day == 20
      end

    when 8

    when 9
      shuubun_day = shuubun_day(year)
      return '秋分の日'     if (shuubun_day == day)
      if year >= 2003
        return '敬老の日'   if (yobi == MONDAY) && (shuu == 3)
        return '国民の休日' if (yobi == TUESDAY) && (day == shuubun_day - 1)
      elsif year >= 1966
        return '敬老の日'   if (day == 15)
      end

    when 10
      if ( year >= 2000)
        return '体育の日' if (yobi == MONDAY) && (shuu == 2)
      elsif (year >= 1966)
        return '体育の日' if (day == 10)
      end

    when 11
      case day
      when  3 ; return '文化の日'
      when 23 ; return '勤労感謝の日'
      when 12 ; return '即位礼正殿の儀' if (year == 1990)
      end

    when 12
      return '天皇誕生日' if (day == 23) && (year >= 1989)
    end
    return nil
  end

  # ruby の (-5/4) は -2 を返すので 1980 を使用する。
  # http://www.h3.dion.ne.jp/~sakatsu/holiday_topic.htm#Note
  #
  def self.shunbun_day(year) # return day
    y1980 = year - 1980
    case year
    when 1948..1979 ; return (20.8357 + (0.242194 * y1980) - (y1980 / 4)).to_i;
    when 1980..2099 ; return (20.8431 + (0.242194 * y1980) - (y1980 / 4)).to_i;
    when 2100..2150 ; return (21.8510 + (0.242194 * y1980) - (y1980 / 4)).to_i;
    end
    return 99 # 祝日法施行前および2151年以降は略算式が無いので不明
  end

  def self.shuubun_day(year) # return day
    y1980 = year - 1980
    case year
    when 1948..1979 ; return (23.2588 + (0.242194 * y1980) - (y1980 / 4)).to_i;
    when 1980..2099 ; return (23.2488 + (0.242194 * y1980) - (y1980 / 4)).to_i;
    when 2100..2150 ; return (24.2488 + (0.242194 * y1980) - (y1980 / 4)).to_i;
    end
    return 99 # 祝日法施行前および2151年以降は略算式が無いので不明
  end
end # of module

class Time
  def shukujitu?
    Shukujitu.shukujitu?(self)
  end
end


