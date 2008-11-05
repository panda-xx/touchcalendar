var MovingHandlers = Class.create({
	// 移動中のX,Y座標
	startposX :0,
	startposY:0,
	originalPositionX : [],
	originalPositionY : [],
	
	// 前回のX,Y座標
	pX :0,
	pY:0,

	//ドラッグ中かどうかのフラグ
	isMoving : false,

	//ドラッグ方向が水平方向かどうかを表すフラグ
	isHorizon : false,

	// ドラッグレイヤーの有無
	isDragLayer : false,

	//　ドラッグ中の要素
	movingElement : null,

	// ドラッグのターゲット
	dragTarget : [],

	// ドラッグのターゲットを退避させる配列
	dragTargetStock : [],

	// 描画領域左上を(0,0)とした場合の、中心年月のX、Y座標
    centralCalendarGrobalStartX : 0,
    centralCalendarGrobalStartY : 0,
    
    // div#calendar要素のobject
    calendarObject : null,
    
    
	// 初期化関数
	initialize : function()
	{		
		// マウスのイベントを設定する
		document.observe('mousedown', this.onMousedown.bindAsEventListener(this));
		document.observe('mousemove', this.onMousemove.bindAsEventListener(this));
		document.observe('mouseup', this.onMouseup.bindAsEventListener(this));
		document.observe('mouseout', this.onMouseout.bindAsEventListener(this));
		this.isDragLayer = true;
		/*
		// IEでは、divのウィンドウ外のドラッグがうまくいかないので、
		// img要素をドラッグさせる
		if(navigator.userAgent.indexOf("MSIE") != -1)
		{
		    var t = document.createElement('img');
			t.id = 'dragLayer';
			document.body.appendChild(t);
		}else if(navigator.userAgent.indexOf("Opera") != -1){
		} else {
		    var t = document.createElement('div');
			t.id = 'dragLayer';
			document.body.appendChild(t);
		}
        this.updateMinX = - 1;
        this.updateMaxX =   1
        this.updateMinY = - 1
        this.updateMaxY =   1
*/
        this.calendarObject = $('calendar');
	},

	// 対象要素の追加(id)
	add : function(targetID)
	{
		this.dragTarget.push(targetID);
	},

	//　対象要素の削除
	remove : function(targetID)
	{
		this.dragTarget = this.dragTarget.without(targetID);
	},
	
	onMouseout : function(evt){
        // IEなら、カーソルが画面外にでたらドラッグを中止する
        if(navigator.userAgent.indexOf("MSIE") != -1){
	        if (evt.pointerX() == -1){
	            this.isMoving = false;
    		    evt.stop();
                if (evt.preventDefault) {
                        evt.preventDefault();
                }
                if (evt.stopPropagation) {
                        evt.stopPropagation();
                }
                this.originalPositionX = [];
                this.originalPositionY = [];
	        }
        }

	},
	// マウスのボタンがクリックされたとき
	onMousedown : function(evt){
	    if (!evt.isLeftClick()){
	        return;
	    }
	    if ( evt.target.id == "dayDisplay" || 
	         evt.target.id == "popClose" || 
	         evt.target.id == "titleTd1" || 
	         evt.target.id == "titleTd2" || 
	         evt.target.id == "titleTd3" || 
	         evt.target.id == "titleTable" || 
	         evt.target.id == "helpBaloon" ||
	         evt.target.className == 'inplace_text_field' || 
	         evt.target.className == 'inplace_span'|| 
	         evt.target.className == 'popDay' || 
	         evt.target.tagName == 'INPUT'){
            return;
	    }
	    if (this.isDragLayer){
		    //クリックされた位置を保存
		    // 動かす要素を取得
		    for ( var i = 0; i < this.dragTarget.length; i++){
    			var targetElement = $(this.dragTarget[i]);
		        // ドキュメントの左上を（0,0)とした現在の位置を保存
		        this.originalPositionX.push(parseFloat(Element.getStyle(targetElement, "left")));
		        this.originalPositionY.push(parseFloat(Element.getStyle(targetElement, "top")));
            }
    		// 現在のマウス位置を保存
		    this.startposX = evt.pointerX();
		    this.startposY = evt.pointerY();


			// 描画領域左上を(0,0)とした場合の、中心年月のX座標
			this.centralCalendarGrobalStartX = parseFloat(Element.getStyle($("calendar"), "left")) + 
                                         parseFloat(Element.getStyle($(centralCalendarId), "left"));

			// 描画領域左上を(0,0)とした場合の、中心年月のY座標
			this.centralCalendarGrobalStartY = parseFloat(Element.getStyle($("calendar"), "top")) + 
                                         parseFloat(Element.getStyle($(centralCalendarId), "top"));

		    // ドラッグ中であるというフラグを立てる
		    this.isMoving = true;
		    evt.stop();
	    }
	},

	// マウス移動中
	onMousemove : function(evt){
		// ドラッグ中であるなら移動する
		if (this.isMoving) {			
			// 何回次月を読み込むか、その数
			var readNum = parseInt((this.centralCalendarGrobalStartX + evt.pointerX() - this.startposX - 
			                        (windowWidth - calendarWidth) / 2.0) / calendarWidth);
			// 移動先の座標と閾値を比較して、次を読み込むかどうか決める。
			// 一気にcalendarWidthを超える移動が発生した場合に対応済み。
		    if ( readNum >= 1){
    			for (var i = 0; i < readNum; i++){
	                addCalendarInLeft(this.calendarObject);
	            }
		        this.centralCalendarGrobalStartX = parseFloat(Element.getStyle($("calendar"), "left")) + 
                                             parseFloat(Element.getStyle($(centralCalendarId), "left"));
            } else if(readNum <= -1) {
	            for (var i = 0; i < - readNum; i++){
	                addCalendarInRight(this.calendarObject);
	            }
		        this.centralCalendarGrobalStartX = parseFloat(Element.getStyle($("calendar"), "left")) + 
                                             parseFloat(Element.getStyle($(centralCalendarId), "left"));
		    }
						
			// 何回次月を読み込むか、その数
			readNum = parseInt((this.centralCalendarGrobalStartY + evt.pointerY() - this.startposY - 
			                   (windowHeight - calendarHeight) / 2.0) / calendarHeight);
			// 移動先の座標と閾値を比較して、次を読み込むかどうか決める。
			// 一気にcalendarWidthを超える移動が発生した場合に対応済み。
		    if ( readNum >= 1){
	            for (var i = 0; i < readNum; i++){
	                addCalendarInTop(this.calendarObject);
	            }
	            this.centralCalendarGrobalStartY = parseFloat(Element.getStyle($("calendar"), "top")) + 
                                             parseFloat(Element.getStyle($(centralCalendarId), "top"));
            } else if ( readNum <= -1){
	            for (var i = 0; i < - readNum; i++){
	                addCalendarInBottom(this.calendarObject);
	            }
	            this.centralCalendarGrobalStartY = parseFloat(Element.getStyle($("calendar"), "top")) + 
                                             parseFloat(Element.getStyle($(centralCalendarId), "top"));
		    }
			// 移動するべき要素を取得
			for ( var i = 0; i < this.dragTarget.length; i++){
			    var targetElement = $(this.dragTarget[i]);
		        // 	差分だけを動かす
				Element.setStyle(targetElement, 
		        {"left": this.originalPositionX[i] + evt.pointerX() - this.startposX + 'px'});
		        Element.setStyle(targetElement, 
		        {"top" : this.originalPositionY[i] + evt.pointerY() - this.startposY + 'px'});
            }
            evt.stop();
		}
	},

	// マウスのボタンが離された
	onMouseup : function(evt)
	{
		// ドラッグ完了
		if ( this.isMoving && this.isDragLayer)
		{
			// 位置を確定する
			// 動かすべき要素を取得
			for ( var i = 0; i < this.dragTarget.length; i++){
			    var targetElement = $(this.dragTarget[i]);
		        // 	差分だけを動かす
		        Element.setStyle(targetElement, 	{"left": this.originalPositionX[i] + evt.pointerX() - this.startposX + 'px'});
		        Element.setStyle(targetElement, 	{"top" : this.originalPositionY[i] + evt.pointerY() - this.startposY + 'px'});
            }
		}
		this.isMoving = false;
		evt.stop();
        if (evt.preventDefault) {
                evt.preventDefault();
        }
        if (evt.stopPropagation) {
                evt.stopPropagation();
        }
        this.originalPositionX = [];
        this.originalPositionY = [];
	}
}
);

/************************************* 
ドラッグした際に、つぎの表を読み込む処理 
 *************************************/

// 右に追加する場合について
addCalendarInRight=function(calendarObject){
    // カレンダーの中心年月を取得し、次に中心となる年月を作成する
    var yearMonth = parseInt(centralCalendarId).toString();
    var year  = parseInt(yearMonth.substr(0,4));
    var month = eval(yearMonth.substr(4,2));
    if ( month == 12 ){
        nextCentralCalendarId = "" + (year + 1) + "01";
    } else if (month < 9){
        nextCentralCalendarId = "" + year + "0" + (month + 1);
    } else {
        nextCentralCalendarId = "" + year + (month + 1);
    }


    
    // すでにあるテーブル要素で不要なものを削除する
    var oldMonths = new Array(3);

    switch (month){
        case 1:
            oldMonths[0] = "" + (year - 2) + "12";
            oldMonths[1] = "" + (year - 1) + "12";
            oldMonths[2] = "" + (year    ) + "12";
            break;
        case 12:
            oldMonths[0] = "" + (year - 1) + "11";
            oldMonths[1] = "" + (year    ) + "11";
            oldMonths[2] = "" + (year + 1) + "11";
            break;
        case 11:
            oldMonths[0] = "" + (year - 1) + "10";
            oldMonths[1] = "" + (year    ) + "10";
            oldMonths[2] = "" + (year + 1) + "10";
            break;
        default:
            oldMonths[0] = "" + (year - 1) + "0" + (month - 1);
            oldMonths[1] = "" +  year      + "0" + (month - 1);
            oldMonths[2] = "" + (year + 1) + "0" + (month - 1);
    }

    for (var i = 0; i < oldMonths.length; i++){
        if ($(oldMonths[i]) == null){
            return;
        }
        $(oldMonths[i]).parentNode.removeChild($(oldMonths[i]));
//        mouseHandler.remove(oldMonths[i]);
    }
    
    // 次のテーブル要素を作成し、追加する table#200810　など
    var nextMonth = new Array(3);
    switch (month){
        case 11:
            nextMonth[0] = "" + (year    ) + "01";
            nextMonth[1] = "" + (year + 1) + "01";
            nextMonth[2] = "" + (year + 2) + "01";
            break;
        case 12:
            nextMonth[0] = "" + (year    ) + "02";
            nextMonth[1] = "" + (year + 1) + "02";
            nextMonth[2] = "" + (year + 2) + "02";
            break;
        case 8:
            nextMonth[0] = "" + (year - 1) + "10";
            nextMonth[1] = "" +  year      + "10";
            nextMonth[2] = "" + (year + 1) + "10";
            break;
        case 9:
            nextMonth[0] = "" + (year - 1) + "11";
            nextMonth[1] = "" +  year      + "11";
            nextMonth[2] = "" + (year + 1) + "11";
            break;
        case 10:
            nextMonth[0] = "" + (year - 1) + "12";
            nextMonth[1] = "" +  year      + "12";
            nextMonth[2] = "" + (year + 1) + "12";
            break;
        default:
            nextMonth[0] = "" + (year - 1) + "0" + (month + 2);
            nextMonth[1] = "" +  year      + "0" + (month + 2);
            nextMonth[2] = "" + (year + 1) + "0" + (month + 2);
    }
    
  
    for (var i = 0; i < nextMonth.length; i++){
        var t = document.createElement('table');
        t.id = nextMonth[i];
        t.className = "month";

        var topPosition = 0;
        var leftPosition = parseFloat(Element.getStyle($(centralCalendarId),"left")) + calendarWidth / 0.95 * 2;     
        /* カレンダーの位置に応じて設定を行う */
        switch (i) {
            case 0 :
                topPosition  = parseFloat(Element.getStyle($(centralCalendarId),"top"))  - calendarHeight / 0.95;
                break;
            case 1 :
                topPosition = parseFloat(Element.getStyle($(centralCalendarId),"top"));
                break;
            case 2 :
                topPosition = parseFloat(Element.getStyle($(centralCalendarId),"top"))   + calendarHeight / 0.95;
                break;
        }
        Element.setStyle(t,
                         {"top" : topPosition + "px",
                          "left": leftPosition + "px",
                          "width": calendarWidth + "px"
                          });
        calendarObject.appendChild(t);

        if ($("tableCloth" + nextMonth[i]) == null){
            // 読み込みが完了するまで表示して億もの
            t = document.createElement('div');
            t.id = "tableCloth" + nextMonth[i];
            t.className = "tableCloth";
            t.innerHTML = "Now loading...";
            Element.setStyle(t,
                             {"top" : topPosition + "px",
                              "left": leftPosition + "px",
                              "width": calendarWidth + "px",
                              "height": calendarHeight + "px"
                              });
            calendarObject.appendChild(t);
        }
        new Ajax.Updater(nextMonth[i], '/member/addNewCalendar/' + nextMonth[i],
                         {asynchronous:true,
                          evalScripts:true,
                          parameters:'authenticity_token=' + encodeURIComponent(authToken)}
                        );
    }    
    
    // 中心年月を更新する
    centralCalendarId = nextCentralCalendarId;
}

// 左に追加する場合
addCalendarInLeft=function(calendarObject){
    // カレンダーの中心年月を取得し、次に中心となる年月を作成する
    var yearMonth = parseInt(centralCalendarId).toString();
    var year  = parseInt(yearMonth.substr(0,4));
    var month = eval(yearMonth.substr(4,2));
    if ( month == 1 ){
        nextCentralCalendarId = "" + (year - 1) + "12";
    } else if (month < 11){
        nextCentralCalendarId = "" + year + "0" + (month - 1);
    } else {
        nextCentralCalendarId = "" + year + (month - 1);
    }

    // すでにあるテーブル要素で不要なものを削除する
    var oldMonths = new Array(3);

    switch (month){
        case 12:
            oldMonths[0] = "" + (year    ) + "01";
            oldMonths[1] = "" + (year + 1) + "01";
            oldMonths[2] = "" + (year + 2) + "01";
            break;
        case 9:
            oldMonths[0] = "" + (year - 1) + "10";
            oldMonths[1] = "" + (year    ) + "10";
            oldMonths[2] = "" + (year + 1) + "10";
            break;
        case 10:
            oldMonths[0] = "" + (year - 1) + "11";
            oldMonths[1] = "" + (year    ) + "11";
            oldMonths[2] = "" + (year + 1) + "11";
            break;
        case 11:
            oldMonths[0] = "" + (year - 1) + "12";
            oldMonths[1] = "" + (year    ) + "12";
            oldMonths[2] = "" + (year + 1) + "12";
            break;
        default:
            oldMonths[0] = "" + (year - 1) + "0" + (month + 1);
            oldMonths[1] = "" +  year      + "0" + (month + 1);
            oldMonths[2] = "" + (year + 1) + "0" + (month + 1);
    }

    for (var i = 0; i < oldMonths.length; i++){
        if ($(oldMonths[i]) == null){
            return;
        }
        $(oldMonths[i]).parentNode.removeChild($(oldMonths[i]));
//        mouseHandler.remove(oldMonths[i]);
    }

    // 次のテーブル要素を作成し、追加する table#200810　など
    var nextMonth = new Array(3);
    switch (month){
        case 2:
            nextMonth[0] = "" + (year - 2) + "12";
            nextMonth[1] = "" + (year - 1) + "12";
            nextMonth[2] = "" + (year    ) + "12";
            break;
        case 1:
            nextMonth[0] = "" + (year - 2) + "11";
            nextMonth[1] = "" + (year - 1) + "11";
            nextMonth[2] = "" + (year    ) + "11";
            break;
        case 12:
            nextMonth[0] = "" + (year - 1) + "10";
            nextMonth[1] = "" + (year    ) + "10";
            nextMonth[2] = "" + (year + 1) + "10";
            break;
        default:
            nextMonth[0] = "" + (year - 1) + "0" + (month - 2);
            nextMonth[1] = "" +  year      + "0" + (month - 2);
            nextMonth[2] = "" + (year + 1) + "0" + (month - 2);
    }
    
    for (var i = 0; i < nextMonth.length; i++){
        var t = document.createElement('table');
        t.id = nextMonth[i];
        t.className = "month";

        var topPosition = 0;
        var leftPosition = parseFloat(Element.getStyle($(centralCalendarId),"left")) - calendarWidth / 0.95 * 2;
        /* カレンダーの位置に応じて設定を行う */
        switch (i) {
            case 0 :
                topPosition  = parseFloat(Element.getStyle($(centralCalendarId),"top"))  - calendarHeight / 0.95;
                break;
            case 1 :
                topPosition = parseFloat(Element.getStyle($(centralCalendarId),"top"));
                break;
            case 2 :
                topPosition = parseFloat(Element.getStyle($(centralCalendarId),"top"))   + calendarHeight / 0.95;
                break;
        }
        Element.setStyle(t,
                         {"top" : topPosition + "px",
                          "left": leftPosition + "px",
                          "width": calendarWidth + "px"
                          });
        calendarObject.appendChild(t);
    
        if ($("tableCloth" + nextMonth[i]) == null){
            // 読み込みが完了するまで表示して億もの
            t = document.createElement('div');
            t.id = "tableCloth" + nextMonth[i];
            t.className = "tableCloth";
            t.innerHTML = "Now loading...";
            Element.setStyle(t,
                             {"top" : topPosition + "px",
                              "left": leftPosition + "px",
                              "width": calendarWidth + "px",
                              "height": calendarHeight + "px"
                              });
            calendarObject.appendChild(t);
        }    
        new Ajax.Updater(nextMonth[i], '/member/addNewCalendar/' + nextMonth[i],
                         {asynchronous:true,
                          evalScripts:true,
                          parameters:'authenticity_token=' + encodeURIComponent(authToken)}
                        );
        // ドラッグ対象に追加
//        mouseHandler.add(nextMonth[i]);
    }    
    
    // 中心年月を更新する
    centralCalendarId = nextCentralCalendarId;
}

// 上に追加する場合
addCalendarInTop=function(calendarObject){
    // カレンダーの中心年月を取得し、次に中心となる年月を作成する
    var yearMonth = parseInt(centralCalendarId).toString();
    var year  = parseInt(yearMonth.substr(0,4));
    var month = eval(yearMonth.substr(4,2));
    if (month < 10){
        nextCentralCalendarId = "" + (year - 1) + "0" + month;
    } else {
        nextCentralCalendarId = "" + (year - 1) + month;
    }
    
    // すでにあるテーブル要素で不要なものを削除する
    var oldMonths = new Array(3);
    switch (month){
        case 12:
            oldMonths[0] = "" + (year + 1) + "11";
            oldMonths[1] = "" + (year + 1) + "12";
            oldMonths[2] = "" + (year + 2) + "01";
            break;
        case 1:
            oldMonths[0] = "" + (year    ) + "12";
            oldMonths[1] = "" + (year + 1) + "01";
            oldMonths[2] = "" + (year + 1) + "02";
            break;
        case 10:
            oldMonths[0] = "" + (year + 1) + "09";
            oldMonths[1] = "" + (year + 1) + "10";
            oldMonths[2] = "" + (year + 1) + "11";
            break;
        case 11:
            oldMonths[0] = "" + (year + 1) + "10";
            oldMonths[1] = "" + (year + 1) + "11";
            oldMonths[2] = "" + (year + 1) + "12";
            break;
        case 9:
            oldMonths[0] = "" + (year + 1) + "08";
            oldMonths[1] = "" + (year + 1) + "09";
            oldMonths[2] = "" + (year + 1) + "10";
            break;
        default:
            oldMonths[0] = "" + (year + 1) + "0" + (month - 1);
            oldMonths[1] = "" + (year + 1) + "0" + month;
            oldMonths[2] = "" + (year + 1) + "0" + (month + 1);
    }
    
    for (var i = 0; i < oldMonths.length; i++){
        if ($(oldMonths[i]) == null){
            return;
        }
        $(oldMonths[i]).parentNode.removeChild($(oldMonths[i]));
  //        mouseHandler.remove(oldMonths[i]);
    }
    
    // 次のテーブル要素を作成し、追加する table#200810　など
    var nextMonth = new Array(3);
    switch (month){
        case 12:
            nextMonth[0] = "" + (year - 2) + "11";
            nextMonth[1] = "" + (year - 2) + "12";
            nextMonth[2] = "" + (year - 1) + "01";
            break;
        case 1:
            nextMonth[0] = "" + (year - 3) + "12";
            nextMonth[1] = "" + (year - 2) + "01";
            nextMonth[2] = "" + (year - 2) + "02";
            break;
        case 10:
            nextMonth[0] = "" + (year - 2) + "09";
            nextMonth[1] = "" + (year - 2) + "10";
            nextMonth[2] = "" + (year - 2) + "11";
            break;
        case 11:
            nextMonth[0] = "" + (year - 2) + "10";
            nextMonth[1] = "" + (year - 2) + "11";
            nextMonth[2] = "" + (year - 2) + "12";
            break;
        case 9:
            nextMonth[0] = "" + (year - 2) + "08";
            nextMonth[1] = "" + (year - 2) + "09";
            nextMonth[2] = "" + (year - 2) + "10";
            break;
        default:
            nextMonth[0] = "" + (year - 2) + "0" + (month - 1);
            nextMonth[1] = "" + (year - 2) + "0" + month;
            nextMonth[2] = "" + (year - 2) + "0" + (month + 1);
    }
    
    for (var i = 0; i < nextMonth.length; i++){
        var t = document.createElement('table');
        t.id = nextMonth[i];
        t.className = "month";

        var topPosition = parseFloat(Element.getStyle($(centralCalendarId),"top")) - calendarHeight / 0.95 * 2;
        var leftPosition = 0;
        /* カレンダーの位置に応じて設定を行う */
        switch (i) {
            // 左上
            case 0 :
                leftPosition  = parseFloat(Element.getStyle($(centralCalendarId),"left"))  - calendarWidth / 0.95;
                break;
            case 1 :
                leftPosition = parseFloat(Element.getStyle($(centralCalendarId),"left"));
                break;
            case 2 :
                leftPosition = parseFloat(Element.getStyle($(centralCalendarId),"left"))   + calendarWidth / 0.95;
                break;
        }


        Element.setStyle(t,
                         {"top" : topPosition + "px",
                          "left": leftPosition + "px",
                          "width": calendarWidth + "px"
                          });
        calendarObject.appendChild(t);
        
        if ($("tableCloth" + nextMonth[i]) == null){
            // 読み込みが完了するまで表示しておくもの
            t = document.createElement('div');
            t.id = "tableCloth" + nextMonth[i];
            t.className = "tableCloth";
            t.innerHTML = "Now loading...";
            Element.setStyle(t,
                             {"top" : topPosition + "px",
                              "left": leftPosition + "px",
                              "width": calendarWidth + "px",
                              "height": calendarHeight + "px"
                              });
            calendarObject.appendChild(t);
        }
        new Ajax.Updater(nextMonth[i], '/member/addNewCalendar/' + nextMonth[i],
                         {asynchronous:true,
                          evalScripts:true,
                          parameters:'authenticity_token=' + encodeURIComponent(authToken)}
                        );
        // ドラッグ対象に追加
//        mouseHandler.add(nextMonth[i]);
    }    
    
    // 中心年月を更新する
    centralCalendarId = nextCentralCalendarId;
}

// 下に追加する場合
addCalendarInBottom=function(calendarObject){
    // カレンダーの中心年月を取得し、次に中心となる年月を作成する
    var yearMonth = parseInt(centralCalendarId).toString();
    var year  = parseInt(yearMonth.substr(0,4));
    var month = eval(yearMonth.substr(4,2));
    if (month < 10){
        nextCentralCalendarId = "" + (year + 1) + "0" + month;
    } else {
        nextCentralCalendarId = "" + (year + 1) + month;
    }
    // すでにあるテーブル要素で不要なものを削除する
    var oldMonths = new Array(3);
    switch (month){
        case 12:
            oldMonths[0] = "" + (year - 1) + "11";
            oldMonths[1] = "" + (year - 1) + "12";
            oldMonths[2] = "" + (year    ) + "01";
            break;
        case 1:
            oldMonths[0] = "" + (year - 2) + "12";
            oldMonths[1] = "" + (year - 1) + "01";
            oldMonths[2] = "" + (year - 1) + "02";
            break;
        case 10:
            oldMonths[0] = "" + (year - 1) + "09";
            oldMonths[1] = "" + (year - 1) + "10";
            oldMonths[2] = "" + (year - 1) + "11";
            break;
        case 11:
            oldMonths[0] = "" + (year - 1) + "10";
            oldMonths[1] = "" + (year - 1) + "11";
            oldMonths[2] = "" + (year - 1) + "12";
            break;
        case 9:
            oldMonths[0] = "" + (year - 1) + "08";
            oldMonths[1] = "" + (year - 1) + "09";
            oldMonths[2] = "" + (year - 1) + "10";
            break;
        default:
            oldMonths[0] = "" + (year - 1) + "0" + (month - 1);
            oldMonths[1] = "" + (year - 1) + "0" + month;
            oldMonths[2] = "" + (year - 1) + "0" + (month + 1);
    }
    
    for (var i = 0; i < oldMonths.length; i++){
        if ($(oldMonths[i]) == null){
            return;
        }
        $(oldMonths[i]).parentNode.removeChild($(oldMonths[i]));
//        mouseHandler.remove(oldMonths[i]);
    }
    
    // 次のテーブル要素を作成し、追加する table#200810　など
    var nextMonth = new Array(3);
    switch (month){
        case 12:
            nextMonth[0] = "" + (year + 2) + "11";
            nextMonth[1] = "" + (year + 2) + "12";
            nextMonth[2] = "" + (year + 3) + "01";
            break;
        case 1:
            nextMonth[0] = "" + (year + 1) + "12";
            nextMonth[1] = "" + (year + 2) + "01";
            nextMonth[2] = "" + (year + 2) + "02";
            break;
        case 10:
            nextMonth[0] = "" + (year + 2) + "09";
            nextMonth[1] = "" + (year + 2) + "10";
            nextMonth[2] = "" + (year + 2) + "11";
            break;
        case 11:
            nextMonth[0] = "" + (year + 2) + "10";
            nextMonth[1] = "" + (year + 2) + "11";
            nextMonth[2] = "" + (year + 2) + "12";
            break;
        case 9:
            nextMonth[0] = "" + (year + 2) + "08";
            nextMonth[1] = "" + (year + 2) + "09";
            nextMonth[2] = "" + (year + 2) + "10";
            break;
        default:
            nextMonth[0] = "" + (year + 2) + "0" + (month - 1);
            nextMonth[1] = "" + (year + 2) + "0" + month;
            nextMonth[2] = "" + (year + 2) + "0" + (month + 1);
    }
    
    for (var i = 0; i < nextMonth.length; i++){
        var t = document.createElement('table');
        t.id = nextMonth[i];
        t.className = "month";

        var topPosition = parseFloat(Element.getStyle($(centralCalendarId),"top")) + calendarHeight / 0.95 * 2;
        var leftPosition = 0;
        /* カレンダーの位置に応じて設定を行う */
        switch (i) {
            case 0 :
                leftPosition  = parseFloat(Element.getStyle($(centralCalendarId),"left"))  - calendarWidth / 0.95;
                break;
            case 1 :
                leftPosition = parseFloat(Element.getStyle($(centralCalendarId),"left"));
                break;
            case 2 :
                leftPosition = parseFloat(Element.getStyle($(centralCalendarId),"left"))   + calendarWidth / 0.95;
                break;
        }
        Element.setStyle(t,
                         {"top" : topPosition + "px",
                          "left": leftPosition + "px",
                          "width": calendarWidth + "px"
                          });
        calendarObject.appendChild(t);
        
        if ($("tableCloth" + nextMonth[i]) == null){
            // 読み込みが完了するまで表示しておくもの
            t = document.createElement('div');
            t.id = "tableCloth" + nextMonth[i];
            t.className = "tableCloth";
            t.innerHTML = "Now loading...";
            Element.setStyle(t,
                             {"top" : topPosition + "px",
                              "left": leftPosition + "px",
                              "width": calendarWidth + "px",
                              "height": calendarHeight + "px"
                              });
            calendarObject.appendChild(t);
        }
        new Ajax.Updater(nextMonth[i], '/member/addNewCalendar/' + nextMonth[i],
                         {asynchronous:true,
                          evalScripts:true,
                          parameters:'authenticity_token=' + encodeURIComponent(authToken)}
                        );
        // ドラッグ対象に追加
//        mouseHandler.add(nextMonth[i]);
    }    
    
    // 中心年月を更新する
    centralCalendarId = nextCentralCalendarId;
}


/*************************************************
 * 月間カレンダーの td div img の高さと幅を調整する *
 *************************************************/
function calendarSizeArranger(objStr){
	var rowHeight = (calendarHeight - 200) / 6;
	var rowWidth = (calendarWidth - 35) / 7;
	if(navigator.userAgent.indexOf("Gecko") != -1)	{
    	all = $(objStr).getElementsByTagName('td');
        for (var i = 0; i < all.length; i++) {
		    if (0 <= (' ' + all[i].className + ' ').indexOf(' todo ')) {
			    Element.setStyle(all[i],  {"height": rowHeight + "px", "width": rowWidth + "px"});
            }
        }
    	all = $(objStr).getElementsByTagName('div');
        for (var i = 0; i < all.length; i++) {
		    if (0 <= (' ' + all[i].className + ' ').indexOf(' todo ')) {
			    Element.setStyle(all[i],  {"height": rowHeight + "px", "width": rowWidth + "px"});
            }
        }
    } else {
    	all    = $(objStr).getElementsByTagName('td');
        divAll = $(objStr).getElementsByTagName('div');
        for (var i = 0; i < all.length; i++) {
		    if (0 <= (' ' + all[i].className + ' ').indexOf(' todo ')) {
			    Element.setStyle(all[i],  {"height": rowHeight + "px", "width": rowWidth + "px"});
            }
        }
        for (var i = 0; i < divAll.length; i++) {
		    if (0 <= (' ' + divAll[i].className + ' ').indexOf(' todo ')) {
			    Element.setStyle(divAll[i],  {"width": rowWidth + "px"});
            }
        }
    }
}

/**********************************************************
 * マウスホイールで大きさ変更 + ポップアップ表示で日を変える  *
 **********************************************************/
Object.extend(Event, 
  {
	wheel:function (event){
		var delta = 0;
		if (!event) event = window.event;
		if (event.wheelDelta) {
			delta = event.wheelDelta/120; 
			if (window.opera) delta = -delta;
		} else if (event.detail) { delta = -event.detail/3;	}
		return Math.round(delta); //Safari Round
	}
  }
);

function wheelHandler(event) {
	var delta = Event.wheel(event);
    // ポップアップ表示されている場合
    if (isWheelZoom == false){
        popupMove(delta);
	    // イベントによる default 動作（ページ遷移など）を無効化する
	    if (event.preventDefault) {
	        event.preventDefault();
	    }
	    else {
	        event.returnValue = false;
	    }
        return false;
    }
    
    // 拡大率 
	var zoomRate = 0.2;
	var all = document.getElementsByTagName('*');
	var widthString = "";
	var heightString = "";
	var topString = "";
	var leftString = "";
	var width = 0;
	var height = 0;
	var top = 0;
	var left = 0;

	// td.todo の大きさを調整するために使用する変数
	var todoHeight = 0;
	var todoHeightSaveFlag = false;

	// ホイールを回転させたマウスカーソルの、div#right上の位置を保存
	var mouseCursorPosX = parseFloat(event.pointerX());
	var mouseCursorPosY = parseFloat(event.pointerY());

    // 中心年月の、div#calendar上の位置
    var centralCalendarPositionX = parseFloat(Element.getStyle($(centralCalendarId), "left"));
    var centralCalendarPositionY = parseFloat(Element.getStyle($(centralCalendarId), "top"));
    
    // マウスカーソルと中心年月の距離
    var cursorCenterDistanceX = mouseCursorPosX - 
                                centralCalendarPositionX - parseFloat(Element.getStyle($("calendar"),"left"));
    var cursorCenterDistanceY = mouseCursorPosY - 
                                centralCalendarPositionY - parseFloat(Element.getStyle($("calendar"),"top"));
    // 拡大縮小により、マウスカーソルが本来あるべき位置からずれた距離
    var deltaDistanceX = cursorCenterDistanceX * zoomRate;
    var deltaDistanceY = cursorCenterDistanceY * zoomRate;
    // カーソル中心に移動させる距離
    var moveDistanceX = 0;
    var moveDistanceY = 0;
    // カーソル中心移動のための処理
    if ( cursorCenterDistanceX < 0){
        if(cursorCenterDistanceY >= 2 * calendarHeight){
            moveDistanceX = - deltaDistanceX;
            moveDistanceY = 2 * deltaDistanceY;
        } else {
            moveDistanceX =   deltaDistanceX;
            moveDistanceY =   deltaDistanceY;
        }
    } else if(cursorCenterDistanceX >= 0 && cursorCenterDistanceX < 2 * calendarWidth){
        if(cursorCenterDistanceY >= 2 * calendarHeight){
            moveDistanceX =   deltaDistanceX;
            moveDistanceY = 2 * deltaDistanceY;
        } else {
            moveDistanceX =   deltaDistanceX;
            moveDistanceY =   deltaDistanceY;
        }
    } else if(cursorCenterDistanceX >= 2 * calendarWidth){
        if(cursorCenterDistanceY >= 2 * calendarHeight){
            moveDistanceX = 2 * deltaDistanceX;
            moveDistanceY = 2 * deltaDistanceY;
        } else {
            moveDistanceX = 2 * deltaDistanceX;
            moveDistanceY =   deltaDistanceY;
        }
    }

	if (delta < 0){
    // 下方向にまわした場合の処理
        if (calendarHeight * (1 + zoomRate) > 6000){
	        if (event.preventDefault) {
	            event.preventDefault();
	        } else {
	            event.returnValue = false;
	        }
	        return false;
        } else {
            calendarHeight = calendarHeight * (1 + zoomRate);
        }
        if (calendarWidth * (1 + zoomRate) > 7000){
	        if (event.preventDefault) {
	            event.preventDefault();
	        } else {
	            event.returnValue = false;
	        }
	        return false;
        } else {
            calendarWidth  = calendarWidth * (1 + zoomRate);
        }
        moveDistanceX = - moveDistanceX;
        moveDistanceY = - moveDistanceY;
	} else {
    // 上方向にまわした場合の処理
        if (calendarHeight * (1 - zoomRate) < 300){
	        if (event.preventDefault) {
	            event.preventDefault();
	        } else {
	            event.returnValue = false;
	        }
	        return false;
        } else {
            calendarHeight = calendarHeight * (1 - zoomRate);
        }
        if (calendarWidth * (1 - zoomRate) < 300){
	        if (event.preventDefault) {
	            event.preventDefault();
	        } else {
	            event.returnValue = false;
	        }
	        return false;
        } else {
            calendarWidth  = calendarWidth * (1 - zoomRate);
        }
	}
   Element.setStyle($('calendar'),  {
                     "left"  :   parseFloat(Element.getStyle($("calendar"),"left")) + moveDistanceX + "px",
                     "top"   :   parseFloat(Element.getStyle($("calendar"),"top")) + moveDistanceY + "px"
                     });
	// 大きさと位置を調整する
    var all = $("right").getElementsByTagName('table');
    for (var i = 0; i < 9; i++) {
		switch ( parseInt(all[i].id) - parseInt($(centralCalendarId).id) ){
			// 左上
			case -189:
			case -101:
		        Element.setStyle(all[i],  {"height": calendarHeight  + "px", 
		                         "width" :   calendarWidth + "px",
		                         "left"  :   centralCalendarPositionX - calendarWidth  / 0.95 + "px",
		                         "top"   :   centralCalendarPositionY - calendarHeight / 0.95 + "px"
		                         });
				break;
			// 上
			case -100:
		        Element.setStyle(all[i],  {"height": calendarHeight  + "px", 
		                         "width" :   calendarWidth + "px",
		                         "left"  :   centralCalendarPositionX + "px",
		                         "top"   :   centralCalendarPositionY - calendarHeight / 0.95 + "px"
		                         });
				break;
			// 右上
			case -99:
			case -11:
		        Element.setStyle(all[i],  {"height": calendarHeight  + "px", 
		                         "width" :   calendarWidth + "px",
		                         "left"  :   centralCalendarPositionX + calendarWidth  / 0.95 + "px",
		                         "top"   :   centralCalendarPositionY - calendarHeight / 0.95 + "px"
		                         });
				break;
			// 左
			case -1:
			case -89:
		        Element.setStyle(all[i],  {"height": calendarHeight  + "px", 
		                         "width" :   calendarWidth + "px",
		                         "left"  :   centralCalendarPositionX - calendarWidth / 0.95 + "px",
		                         "top"   :   centralCalendarPositionY + "px"
		                         });
				break;
			// 真ん中
	    	case 0:
		        Element.setStyle(all[i],  {"height": calendarHeight  + "px", 
		                         "width" :   calendarWidth + "px",
		                         "left"  :   centralCalendarPositionX + "px",
		                         "top"   :   centralCalendarPositionY + "px"
		                         });
				break;
			// 右
			case 1:
			case 89:
		        Element.setStyle(all[i],  {"height": calendarHeight  + "px", 
		                         "width" :   calendarWidth + "px",
		                         "left"  :   centralCalendarPositionX + calendarWidth / 0.95 + "px",
		                         "top"   :   centralCalendarPositionY + "px"
		                         });
				break;
			// 左下
			case 11:
			case 99:
		        Element.setStyle(all[i],  {"height": calendarHeight  + "px", 
		                         "width" :   calendarWidth + "px",
		                         "left"  :   centralCalendarPositionX - calendarWidth  / 0.95 + "px",
		                         "top"   :   centralCalendarPositionY + calendarHeight / 0.95 + "px"
		                         });
				break;
			// 下
			case 100:
		        Element.setStyle(all[i],  {"height": calendarHeight  + "px", 
		                         "width" :   calendarWidth + "px",
		                         "left"  :   centralCalendarPositionX + "px",
		                         "top"   :   centralCalendarPositionY + calendarHeight / 0.95 + "px"
		                         });
				break;
			// 下右（波動拳）
			case 101:
			case 189:
		        Element.setStyle(all[i],  {"height": calendarHeight  + "px", 
		                         "width" :   calendarWidth + "px",
		                         "left"  :   centralCalendarPositionX + calendarWidth  / 0.95 + "px",
		                         "top"   :   centralCalendarPositionY + calendarHeight / 0.95 + "px"
		                         });
				break;
		}
    }
    
    // ホイール拡縮でdiv#calendarが動いたことにより、次月読み込みが発生したかどうかを判定する
    // 動いてたら読み込む
    // X座標について
/*    var calendarNextX = parseFloat(Element.getStyle($('calendar'), "left"));
	// 移動先の座標と閾値を比較して、次を読み込むかどうか決める。
	// 一気にcalendarWidthを超える移動が発生した場合に対応済み。
	while(true){
        if ( calendarNextX > this.updateMaxX * calendarWidth / 0.95){
            addCalendarInLeft(this.calendarObject);
            this.updateMinX++;
            this.updateMaxX++;
        }
        else if (calendarNextX < this.updateMinX * calendarWidth / 0.95){
            addCalendarInRight(this.calendarObject);
            this.updateMinX--;
            this.updateMaxX--;
		} else {
			break;
		}
    }
	
    // Y座標について
    calendarCurrentY = parseFloat(Element.getStyle(this.calendarObject, "top"));
    calendarNextY = calendarCurrentY + evt.pointerY() - this.startposY;
    while(true){
        if ( calendarNextY > this.updateMaxY * calendarHeight / 0.95){
            addCalendarInTop(this.calendarObject);
            this.updateMinY++;
            this.updateMaxY++;
        } else if (calendarNextY < this.updateMinY * calendarHeight / 0.95){
            addCalendarInBottom(this.calendarObject);
            this.updateMinY--;
            this.updateMaxY--;
        } else {
			break;
		}
	}
	// 移動するべき要素を取得
	for ( var i = 0; i < this.dragTarget.length; i++){
	    var targetElement = $(this.dragTarget[i]);
        // 	差分だけを動かす
		Element.setStyle(targetElement, 
        {"left": this.originalPositionX[i] + evt.pointerX() - this.startposX + 'px'});
        Element.setStyle(targetElement, 
        {"top" : this.originalPositionY[i] + evt.pointerY() - this.startposY + 'px'});
    }
    evt.stop();
*/

    
    // tdの高さとかを調整する
    calendarSizeArranger('calendar');



	// イベントによる default 動作（ページ遷移など）を無効化する
	if (event.preventDefault) {
	    event.preventDefault();
	}
	else {
	    event.returnValue = false;
	}
	return false;
}


/*************************
 *   日表示をポップアップ  *
 *************************/
function dayDisplayPopup(date) {
    if (baloonMakingFlag == true){
        return ;
    }
    // すでにdayDisplayがあるかどうかチェック。あったら消す
    if ($('dayDisplay') != null){
        dayDisplayClose();
    }
    //  ホイールで拡縮を無効化
    isWheelZoom = false;
    // 吹き出しを作成中であることを示すフラグを立てる
    baloonMakingFlag = true;
    var t = document.createElement('div');
    t.id = "dayDisplay";
    t.style.height = "0px";
    t.style.width  = "0px";
    t.style.left   = "-1000px";
    t.style.top    = "-1000px";

    $('right').appendChild(t);
    var tmpHeight;
    var tmpWidth;
    var tmpTop;
    var tmpLeft;

	if(navigator.userAgent.indexOf("Gecko") != -1)	{
	    tmpWidth = parseFloat(window.innerWidth);
	    tmpHeight = parseFloat(window.innerHeight) - 60;
    } else {
        if (document.body.clientHeight){
	        tmpWidth = parseFloat(document.body.clientWidth);
	        tmpHeight = parseFloat(document.body.clientHeight) - 60;
        } else {
            tmpWidth = parseFloat(document.body.parentElement.clientWidth);
	        tmpHeight = parseFloat(document.body.parentElement.clientHeight) - 60;
        }
    }
    tmpWidth  = tmpWidth  * 0.95;
    tmpHeight = tmpHeight * 0.95;

    // ポップアップ用のウィンドウサイズを設定する
    // IEでホイール移動するとき、小数点以下があると少しずつずれていってしまうのでparseInt
    popupWidth  = parseInt(tmpWidth * 0.70);
    popupHeight = parseInt(tmpHeight * 0.50);
    if (popupHeight < 0) popupHeight = 60.0;

    
    // そのテーブル要素に入れるものを作成する
    new Ajax.Updater("dayDisplay", '/member/popupDayCalendar/' + date,
                      {asynchronous:true,
                       evalScripts:true, 
                       parameters:'authenticity_token=' + encodeURIComponent(authToken)
                      }
                     );
    mouseHandler.add('dayDisplay');

    mouseHandler.add('baloon_top');
    mouseHandler.add('baloon_bottom');
    mouseHandler.add('baloon_left');
    mouseHandler.add('baloon_right');
    mouseHandler.add('baloon_top_left');
    mouseHandler.add('baloon_top_right');
    mouseHandler.add('baloon_bottom_right');
    mouseHandler.add('baloon_bottom_left');
    mouseHandler.add('baloon_shadow');
    
}

// 日表示を消す
function dayDisplayClose() {
    // popDays が移動中の場合は日表示を消さない
    for (var i = 0; i < objStrArray.length; i++){
        if (objStrArray[i] == "popDays" || objStrArray[i] == "dayDisplay"){
            return;
        }
    }
    disappearBaloon();
    mouseHandler.remove('baloon_top');
    mouseHandler.remove('baloon_bottom');
    mouseHandler.remove('baloon_left');
    mouseHandler.remove('baloon_right');
    mouseHandler.remove('dayDisplay');
    mouseHandler.remove('baloon_top_left');
    mouseHandler.remove('baloon_top_right');
    mouseHandler.remove('baloon_bottom_right');
    mouseHandler.remove('baloon_bottom_left');
    mouseHandler.remove('baloon_shadow');
    $('dayDisplay').parentNode.removeChild($('dayDisplay'));
    isWheelZoom = true;
    popupMaxDay = "";
    popupMinDay = "";
    // ポップアップの次週読み込みしきい値
    popupReadNextValue = - popupWidth * 14
    popupReadBeforeValue = 0;
    // ポップアップ次週読み込み時に使用する。以前のカレンダーを退避させるために使う
    hideOldDays = "";
    allDelta = 0;
    currentDayNum = 7;
    popupDayHeights = new Array();
    movingCount =  new Array();
    objStrArray = new Array();
}

// 日表示を囲むバルーンを表示する
function popupBaloon(top, right, bottom, left){
    var baloon_width  = right  - left;
    var baloon_height = bottom - top;
    // 吹き出しの各パーツの高さと幅を取得
    var baloon_top_height    = parseFloat(Element.getStyle($('baloon_top'),    "height"));
    var baloon_bottom_height = parseFloat(Element.getStyle($('baloon_bottom'), "height"));
    var baloon_left_width    = parseFloat(Element.getStyle($('baloon_left'),   "width"));
    var baloon_right_width   = parseFloat(Element.getStyle($('baloon_right'),  "width"));
    Element.setStyle($('baloon_top'),
                     {"width"  : baloon_width + "px",
                      "left"   : left + "px",
                      "top"    : top - baloon_top_height + 1 + "px"
                      });
    Element.setStyle($('baloon_right'),
                     {"height"  : baloon_height + "px",
                      "left"   : right + "px",
                      "top"    : top + "px"
                      });
    Element.setStyle($('baloon_bottom'),
                     {"width"  : baloon_width + "px",
                      "left"   : left + "px",
                      "top"    : bottom + "px"
                      });
    // safari 対策で1px足してある
    Element.setStyle($('baloon_left'),
                     {"height" : baloon_height + "px",
                      "top"    : top + "px",
                      "left"  : left - baloon_left_width + 1 + "px"
                      });

    // safari 対策で1px足してある
    Element.setStyle($('baloon_top_left'),
                     {"top" : top - baloon_top_height + 1  + "px",
                      "left"  : left - baloon_left_width + 1 + "px"
                      });
    Element.setStyle($('baloon_top_right'),
                     {"left"   : right + "px",
                      "top" :  top - baloon_top_height + 1  + "px"
                      });
    Element.setStyle($('baloon_bottom_right'),
                     {"top"    : bottom + "px",
                      "left"   : right + "px"
                      });
    // safari 対策で1px足してある
    Element.setStyle($('baloon_bottom_left'),
                     {"top"   : bottom + "px",
                      "left"  : left - baloon_left_width + 1 + "px"
                      });
    Element.setStyle($('baloon_shadow'),
                     {"top"    : top - baloon_top_height + "px",
                      "left"   : left - baloon_left_width + "px",
                      "height" : (baloon_height + baloon_top_height + baloon_bottom_height) * 1.05 + "px",
                      "width"  : (baloon_width + baloon_left_width + baloon_right_width) * 1.05 + "px"
                      });
}

// 日表示を囲むバルーンを消す
function disappearBaloon(){
    Element.setStyle($('baloon_top'),
                     {"top"  : - 100 + "px",
                      "left" : - 100 + "px",
                      "width"  : "0px"});
    Element.setStyle($('baloon_right'),
                     {"top"  : - 100 + "px",
                      "left" : - 100 + "px",
                      "height"  : "0px"});
    Element.setStyle($('baloon_bottom'),
                     {"top"  : - 100 + "px",
                      "left" : - 100 + "px",
                      "width"  : "0px"});
    Element.setStyle($('baloon_left'),
                     {"top"  : - 100 + "px",
                      "left" : - 100 + "px",
                      "height"  : "0px"});

    Element.setStyle($('baloon_top_left'),
                     {"top"  : - 100 + "px",
                      "left" : - 100 + "px"
                      });
    Element.setStyle($('baloon_top_right'),
                     {"left" : - 100 + "px",
                      "top"  :  - 100 + "px"
                      });
    Element.setStyle($('baloon_bottom_right'),
                     {"top"  : - 100 + "px",
                      "left" : - 100 + "px"
                      });
    Element.setStyle($('baloon_bottom_left'),
                     {"top"  : - 100 + "px",
                      "left" : - 100 + "px"
                      });
    Element.setStyle($('baloon_shadow'),
                     {"top"  : - 100 + "px",
                      "left" : - 100 + "px",
                      "width"  : 0 + "px" });
}

/****************************************************************
 * 未来の日付（7日分）を読み込む
 * date: 20080808などの日付。
 *       いま表示されているもののなかで、もっとも新しい日付が入る
 ****************************************************************/
function readNextDays(date){
    var year  = parseInt(date.substr(0,4));
    var month = eval(date.substr(4,2)) - 1;
    var day   = eval(date.substr(6,2));
    var dateObject = new Date(year, month, day);

    // 次のdiv要素を作成し、追加する div#20081009　など
    var dateString = new Array(7);
    for (var i = 0; i < 7; i++){
        dateString[i] = "";
        dateObject.setDate(dateObject.getDate() + 1);
        dateString[i] = dateObject.getFullYear();
        if (dateObject.getMonth() < 9){
            dateString[i] = dateString[i] + "0" + (dateObject.getMonth() + 1);
        } else {
            dateString[i] = "" +  dateString[i] + (dateObject.getMonth() + 1);
        }
        if (dateObject.getDate() < 10){
            dateString[i] = dateString[i] + "0" + dateObject.getDate();
        } else {
            dateString[i] = "" + dateString[i] + dateObject.getDate();
        }

        var t = document.createElement('div');
        t.id = dateString[i];

        Element.setStyle(t,
                         {"top" : "0px",
                          "left": parseFloat(Element.getStyle($(popupMaxDay), "left")) + popupWidth * (i + 1) + "px",
                          "width": popupWidth + "px"
                          });
        $('popDays').appendChild(t);
        popupDayHeights.push(popupHeight);
    }

    // わざわざ上のループとは分けた。要素の挿入が完全に終わっていないと、
    // 次の処理で同期がとれなくなるので。
    for (var i = 0; i < 7; i++){
        // そのテーブル要素に入れるものを作成する
        new Ajax.Updater(dateString[i], '/member/addPopupDayNext/' + dateString[i],
                          {asynchronous:true,
                           evalScripts:true, 
                           parameters:'authenticity_token=' + encodeURIComponent(authToken)
                          }
                         );
    }
    // 最新年月日と更新しきい値（未来方向）を更新する
    popupMaxDay = dateString[6];
    popupReadNextValue = popupReadNextValue - popupWidth * 7;
}

/*
 * 過去の日付（7日分）を読み込む
 * date: 20080808などの日付。
 *       いま表示されているもののなかで、もっとも古い日付が入る
 */

function readBeforeDays(date){
    var year  = parseInt(date.substr(0,4));
    var month = eval(date.substr(4,2)) - 1;
    var day   = eval(date.substr(6,2));
    var dateObject = new Date(year, month, day);

    // 次のdiv要素を作成し、追加する div#20081009　など
    var dateString = new Array(7);
    for (var i = 0; i < 7; i++){
        dateString[i] = "";
        dateObject.setDate(dateObject.getDate() - 1);
        dateString[i] = dateObject.getFullYear();
        if (dateObject.getMonth() < 9){
            dateString[i] = dateString[i] + "0" + (dateObject.getMonth() + 1);
        } else {
            dateString[i] = "" +  dateString[i] + (dateObject.getMonth() + 1);
        }
        if (dateObject.getDate() < 10){
            dateString[i] = dateString[i] + "0" + dateObject.getDate();
        } else {
            dateString[i] = "" + dateString[i] + dateObject.getDate();
        }

        var t = document.createElement('div');
        t.id = dateString[i];
        Element.setStyle(t,
                         {"top" : "0px",
                          "left": parseFloat(Element.getStyle($(popupMinDay), "left")) - popupWidth * (i + 1) + "px",
                          "width": popupWidth + "px"
                          });
        if ( $('popDays').firstChild == null){
            return;
        }
        // popdaysのノードツリーの、前方に要素を挿入する
        $('popDays').insertBefore(t, $('popDays').firstChild);
        // とりあえず高さを配列に入れておく
        popupDayHeights.unshift(popupHeight);
        currentDayNum++;
    }

    // わざわざ上のループとは分けた。要素の挿入が完全に終わっていないと、
    // 次の処理で同期がとれなくなるので。
    for (var i = 0; i < 7; i++){
        // そのテーブル要素に入れるものを作成する
        new Ajax.Updater(dateString[i], '/member/addPopupDayBefore/' + dateString[i],
                          {asynchronous:true,
                           evalScripts:true, 
                           parameters:'authenticity_token=' + encodeURIComponent(authToken)
                          }
                         );
    }    
    
    // 最新年月日と更新しきい値（未来方向）を更新する
    popupMinDay = dateString[6];
    popupReadBeforeValue = popupReadBeforeValue + popupWidth * 7;
}

/* div#dayDisplayの高さを記憶するメソッド
   dayHeight >= 0 なら未来の日付の高さ
   dayHeight < 0 なら過去の日付の高さ
 */
function popupDayHeightsWriter(dayHeight){
    if ( dayHeight >= 0 ){
        popupDayHeights.push(dayHeight);
    } else {
        popupDayHeights.unshift(Math.abs( - dayHeight));
        currentDayNum++;
    }
}

/*******************************
 * ホイールでpopDaysを動かす関数 *
 *******************************/

function popupMove(delta){
    if (delta < 0){
    // 下方向にまわした場合の処理
        // 要素が移動中でない場合
        if (elementMover('popDays', - popupWidth, 0, 200) == true){
            // 端数のせいでうまく比較できないことがあるのであえてparseIntしてある
            if ( parseInt(Element.getStyle($('popDays'), "left")) - popupWidth <= parseInt(popupReadNextValue)){
                // 次を読み込む処理を入れる
                readNextDays(popupMaxDay);
            }
            currentDayNum = currentDayNum + 1;
            // 高さ配列に値が入っていない場合
            if ( popupDayHeights.length - 1 <= currentDayNum || currentDayNum < 0 ){
                Element.setStyle($('dayDisplay'), {"height" : popupHeight + "px"});
                // 吹き出しの高さ調整
                baloonHeightArranger(popupHeight);
            } else {
                Element.setStyle($('dayDisplay'), {"height" : popupDayHeights[currentDayNum] + "px"});
                // 吹き出しの高さ調整
                baloonHeightArranger(popupDayHeights[currentDayNum]);
/*  style.height 版も作ってみた。早さが変わるかと思ったけどかわらなかった
                $('dayDisplay').style.height = popupDayHeights[currentDayNum] + "px";
                // 吹き出しの高さ調整
                $('baloon_right').style.height = popupDayHeights[currentDayNum] + "px";
                $('baloon_left').style.height = popupDayHeights[currentDayNum] + "px";
                $('baloon_bottom').style.top = dayDisplayHeight + popupDayHeights[currentDayNum] + "px";
                $('baloon_bottom_right').style.top = dayDisplayHeight + popupDayHeights[currentDayNum] + "px";
                $('baloon_bottom_left').style.top = dayDisplayHeight + popupDayHeights[currentDayNum] + "px";
*/
            }
        }
        
    } else {
    // 上方向にまわした場合の処理
        // 要素が移動中でない場合
        if (elementMover('popDays', popupWidth, 0, 200) == true){
            // 端数のせいでうまく比較できないことがあるのであえてparseIntしてある
            if ( parseInt(Element.getStyle($('popDays'), "left")) + popupWidth>= parseInt(popupReadBeforeValue) ){
            // 次を読み込む処理を入れる
                readBeforeDays(popupMinDay);
            }
            currentDayNum = currentDayNum - 1;
            // 高さ配列に値が入っていない場合
            if ( popupDayHeights.length - 1 <= currentDayNum || currentDayNum < 0 ){
                Element.setStyle($('dayDisplay'), {"height" : popupHeight + "px"});
                // 吹き出しの高さ調整
                baloonHeightArranger(popupHeight);
            } else {
                Element.setStyle($('dayDisplay'), {"height" : popupDayHeights[currentDayNum] + "px"});
                // 吹き出しの高さ調整
                baloonHeightArranger(popupDayHeights[currentDayNum]);
            }
        }
    }
}
/****************************************************
 *  日表示でTodoを消したらしましまがズレるのでその対策 *
 ****************************************************/
function arrangeRowColor(tableId){

    var tmpTrObj = $(tableId).down(1);
    if (tmpTrObj){
    }else{
        return;
    }
    if (tmpTrObj.tagName != 'tr' && tmpTrObj.tagName != 'TR'){
        return;
    }
    var rowNum = 0;
    while(tmpTrObj){
        if (rowNum % 2 == 0){
            tmpTrObj.style.backgroundColor = "#E5ECF9";
        } else {
            tmpTrObj.style.backgroundColor = "transparent";
        }
        tmpTrObj = tmpTrObj.next(0);
        rowNum++;
    }
}

/*******************
 * 要素を動かす関数 *
 *******************/

var g_IdViser = new Array();
var g_NumViser = 0;
var g_i = 0;
var movingCount =  new Array();
var objStrArray = new Array();

function elementMover(objStr, leftDistance, topDistance, miliSecond){
    // objStrが移動中の場合は、移動が終わるまで待つ
    for (var i = 0; i < objStrArray.length; i++){
        if (objStrArray[i] == objStr){
            return false;
        }
    }
    objStrArray.push(objStr);
	var smooth = 20;
	var drawMaxCount = miliSecond / smooth;
	var leftVelocity = leftDistance / drawMaxCount;
	var topVelocity  = topDistance  / drawMaxCount;
	movingCount[g_NumViser] = 0;
	var leftPosition = parseFloat(Element.getStyle($(objStr), 'left'));
	var topPosition  = parseFloat(Element.getStyle($(objStr), 'top'));
	strFunc = "" + 
		"var left = " + leftPosition + " + (" + leftVelocity + ") * (movingCount[" + g_NumViser + "] + 1 );" +
		"var top  = " + topPosition  + " + (" + topVelocity + ")  * (movingCount[" + g_NumViser + "] + 1 );" +
		"Element.setStyle($('" + objStr + "'), {'left' : left + 'px', 'top'  : top  + 'px'});" + 
		"movingCount[" + g_NumViser + "]++;" + 
		"if (movingCount[" + g_NumViser + "] + 1 >= parseInt(" +  drawMaxCount + ")){" + 
			"clearInterval(g_IdViser[" + g_NumViser + "]);" +
			"Element.setStyle($('" + objStr + "'), {'left' :" + (leftPosition + leftDistance) + " + 'px', 'top'  : " + (topPosition + topDistance) + " + 'px'});" + 
            "for (var i = 0; i < objStrArray.length; i++){" + 
                "if (objStrArray[i] =='" +  objStr + "'){" +
                    "objStrArray[i] = '';" +
                "}" +
            "}" +
		"}";
    g_IdViser[g_NumViser] = setInterval( strFunc , smooth);
    g_NumViser++;
    return true;
}

/**********************************
 * 要素の高さを徐々に変化させる関数 *
 **********************************/

function elementHeightChanger(objStr, firstHeight, finalHeight, miliSecond){
    // objStrが動作中の場合は、動作が終わるまで待つ
    for (var i = 0; i < objStrArray.length; i++){
        if (objStrArray[i] == objStr){
            return false;
        }
    }
    objStrArray.push(objStr);
	var smooth = 10;
	var drawMaxCount = miliSecond / smooth;
	var heightVelocity = (finalHeight - firstHeight)/ drawMaxCount;
	movingCount[g_NumViser] = 0;
	strFunc = "" + 
		"var height  =  " + firstHeight + " + (" + heightVelocity + ") * (movingCount[" + g_NumViser + "] + 1 );" +
		"Element.setStyle($('" + objStr + "'), {'height' : height + 'px'});" + 
		"movingCount[" + g_NumViser + "]++;" + 
		"if (movingCount[" + g_NumViser + "] >= parseInt(" +  drawMaxCount + ")){" + 
			"clearInterval(g_IdViser[" + g_NumViser + "]);" +
			
            "for (var i = 0; i < objStrArray.length; i++){" + 
                "if (objStrArray[i] =='" +  objStr + "'){" +
                    "objStrArray[i] = '';" +
                "}" +
            "}" +
		"}";
    g_IdViser[g_NumViser] = setInterval( strFunc , smooth);
    g_NumViser++;
    return true;
}

/*******************************
 * 吹き出しの高さを調整する関数  *
 * 初期配置には使えない。途中で  *
 * 高さが変わる時にしか使えない。*
 *******************************/
function baloonHeightArranger(dayDisplayHeight){
     // 吹き出しの高さ調整
    var dayDisplayTopPosition = parseFloat(Element.getStyle($('dayDisplay'), "top"));
    Element.setStyle($('baloon_right'),        {"height" : dayDisplayHeight + "px"});
    Element.setStyle($('baloon_left'),         {"height" : dayDisplayHeight + "px"});
    Element.setStyle($('baloon_bottom'),       {"top"    : dayDisplayTopPosition + dayDisplayHeight + "px"});
    Element.setStyle($('baloon_bottom_right'), {"top"    : dayDisplayTopPosition + dayDisplayHeight + "px"});
    Element.setStyle($('baloon_bottom_left'),  {"top"    : dayDisplayTopPosition + dayDisplayHeight + "px"});
    // 影の高さ調整
    Element.setStyle($('baloon_shadow'), {"height" : (dayDisplayHeight + 
        parseFloat(Element.getStyle($('baloon_top'), "height")) + 
        parseFloat(Element.getStyle($('baloon_bottom'), "height"))) * 1.05 + "px"});


}

/*****************************
 *  How to useのバルーンを出す*
 *****************************/
function appearHelpBaloon(){
    if ($('helpBaloon')){
        $('helpBaloon').parentNode.removeChild($('helpBaloon'));
    } else {
        var t = document.createElement('div');
        t.id = 'helpBaloon';
        t.style.right = '0px';
        t.style.top = '30px';
        t.style.width = '300px';
        t.style.height = '120px';
        t.style.zIndex = 100;
        t.style.borderStyle = 'dotted';
        t.style.borderWidth = '3px';
        t.style.backgroundColor = 'white';
        t.style.color = '#5E8EAB';
        t.style.textAlign = 'center';
        t.style.position = 'absolute';
        $('container').appendChild(t);
        $('helpBaloon').innerHTML = "<div style='cursor:pointer;font-size:14px;background-color:#f5f5f5' onclick='$(\"helpBaloon\").parentNode.removeChild($(\"helpBaloon\"));'>close</div>" + "<table style='width:290px;font-size:16px;'><tbody><tr></tr><td style='text-align:right'>Mouse Drag -></td><td style='text-align:left'>Move</td></tr><tr><td style='text-align:right'>Wheel Rotation -></td><td style='text-align:left'>Zoom</td></tr><tr><td style='text-align:right'>Double Click -></td><td style='text-align:left'>One Day List</td></tr><tr><td style='text-align:right'>Wheel on One Day List -></td><td style='text-align:left'>Move</td></tr></tbody></table>";
    }
}


