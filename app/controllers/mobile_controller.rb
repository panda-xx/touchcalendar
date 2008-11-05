class MobileController < ApplicationController
    require "date"


    # Top page
    def index
        begin
            if params[:id]
                @today = Time.mktime(params[:id][0, 4].to_i, params[:id][4, 2].to_i, params[:id][6, 2].to_i, 0, 0)
            else
                @today = Time.mktime(Time.now.year, Time.now.month, Time.now.day, 0, 0)
            end
            @todo = Todo.find(:all,
		                      :conditions => [ "member_id = ? AND limit_datetime >= ? AND limit_datetime <= ? ", 
		                                       0, 
		                                       @today, @today + 86400
		                                     ],
                              :order => 'id')
            @shukujitsu_flag = 0
	        if @today.shukujitu? != nil
                @shukujitsu_flag = 1
            end
            @date_options, @hour_options = todo_bar(@today.year, @today.month, @today.day)
        rescue
            render :partial => 'calendar_table_error'
            return
        end    
    end

    #########################################
    # ひと月分のカレンダーを取得するアクション
    # index アクションで使う
    # 
    # returns : [dates,todos] array
    #########################################
    def month_of_date_todo (year, month)
        first_day_of_this_month = Time.mktime(year, month, 1, 0, 0)
        first_day_of_first_week = first_day_of_this_month - first_day_of_this_month.wday * 86400
        if month != 12
        	last_day_of_this_month = Time.mktime(year, month + 1, 1, 0, 0) - 1
        else 
        	last_day_of_this_month = Time.mktime(year + 1, 1, 1, 0, 0) - 1
        end
        if last_day_of_this_month.strftime("%U").to_i - first_day_of_first_week.strftime("%U").to_i == 4
        	last_day_of_last_week = last_day_of_this_month + (6 - last_day_of_this_month.wday) * 86400 + 604800
        elsif last_day_of_this_month.strftime("%U").to_i - first_day_of_first_week.strftime("%U").to_i == 3
        	last_day_of_last_week = last_day_of_this_month + (6 - last_day_of_this_month.wday) * 86400 + 604800 * 2
        else 
        	last_day_of_last_week = last_day_of_this_month + (6 - last_day_of_this_month.wday) * 86400
        end

        # Make calendar
        tmp_day = Time.mktime(first_day_of_first_week.year,
					        first_day_of_first_week.month,
					        first_day_of_first_week.day, 0, 0)
        tmp_date_todo = Array.new(2)
        tmp_date_todo[0] = Array.new()
        tmp_date_todo[1] = Array.new()
        shukujitsu_index = Array.new()

        while tmp_day <= last_day_of_last_week
	        tmp_date_todo[0] << Time.mktime(tmp_day.year, tmp_day.month, tmp_day.day, 0, 0)
	        if tmp_date_todo[0][-1].shukujitu? != nil
		        shukujitsu_index << tmp_date_todo[0].length - 1
            end
	        tmp_day = tmp_day + 86400
            tmp_date_todo[1] << ""
        end
	
	    # Get this month's todo	
        todo_list = Todo.find(:all,
		    :conditions => [ "member_id = ? AND limit_datetime >= ? AND limit_datetime <= ? ", 
		    0, first_day_of_first_week, last_day_of_last_week],
		    :order => 'id')

        # 月のはじめの日にちのindexを保存
        first_day_of_this_month_index = first_day_of_this_month.wday
        # 月の最後の日にちのindexを保存
        last_day_of_this_month_index = first_day_of_this_month_index + last_day_of_this_month.day - 1
        todo_list.each do |todo|
            # 先月の場合
		    if todo.limit_datetime < first_day_of_this_month
    		    date_index = todo.limit_datetime.wday
            # 来月の場合
		    elsif todo.limit_datetime > last_day_of_this_month
    		    date_index = todo.limit_datetime.day + last_day_of_this_month_index
            # 今月の場合
		    else
		        date_index = first_day_of_this_month_index + todo.limit_datetime.day - 1
		    end 
		    if todo.text != nil
                tmp_date_todo[1][date_index] = tmp_date_todo[1][date_index] + todo.text + "<br>"
	        end
        end
	    return tmp_date_todo, shukujitsu_index
    end
    
  # サイドバー用のメソッド 
  def todo_bar(year, month, day)
	date = Time.mktime(year, month, day, 0, 0)
	date_options = Array.new(30)
    30.times { |i|
		date_options[i] = "<option>" + (date + 60*60*24*i).strftime("%m/%d %a") + "</option>"
	}
	hour_options = Array.new(24)
	24.times { |i|
		hour_options[i] = "<option>" + (date + 60*60*(i + 1)).strftime("%p %I") + "</option>"
	}
	return date_options, hour_options
  end

  #########################
  # Todo登録用のアクション #
  #########################
  def create
    if params[:todo_text] == nil || params[:todo_text] == ""
        redirect_to :controller => 'mobile', :action => 'index', :id => params[:id]
        return
    end
    @todo = Todo.new()
	@todo.member_id = 0
    @todo.text = params[:todo_text]
    # とりあえずidから日付を取得
    year  = params[:id][0, 4].to_i
    id_month = params[:id][4, 2].to_i
    id_day   = params[:id][6, 2].to_i

    # :limit_date から月と日を取得
    month = params[:limit_date][0, 2].to_i
    day   = params[:limit_date][3, 2].to_i
    
    # 年を跨ぐ場合はid_yearを調整
    if month < id_month
        year = year + 1
    end
	# limit_datetime column
	@todo.limit_datetime = Time.mktime(year, month, day, 23, 59, 59)

	if @todo.save
    else
      flash[:notice] = 'Missed to registrate a todo'
    end
    redirect_to :controller => 'mobile', :action => 'index', :id => params[:id]
  end

  #################
  # delete a todo #
  #################
  def delete 
    begin
        idLength = params[:id].length - 8
        @todo = Todo.find(params[:id][0, idLength])
    rescue
        # todoがみつからなかった場合。
        redirect_to :controller => 'mobile'
        return
    end
    if @todo != nil
        @todo.destroy
    end
    redirect_to :controller => 'mobile' , :action => 'index', :id => params[:id][idLength, 8]
  end

end
