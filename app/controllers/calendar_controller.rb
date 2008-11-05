class CalendarController < ApplicationController
# before_filter :block_non_members
 before_filter :redirect_for_mobile

 in_place_edit_for :todo, :text
 require "date"
 require "shukujitsu"
 
  # for Mobile Phone redirector
  def redirect_for_mobile
    if request.mobile?
      pa = params.dup
      pa[:controller] = "/mobile"
      pa[:action] = "index"
      redirect_to pa
    end
  end

  # サイドバー用のメソッド 
  def todo_bar
	date = Time.now
	date_options = Array.new(31)
	date_options[0] = "<option>(指定なし)</option>"
    30.times { |i|
		date_options[i+1] = "<option>" + (date + 60*60*24*i).strftime("%m/%d %a") + "</option>"
	}
	hour_options = Array.new(25)
	hour_options[0] = "<option>(指定なし)</option>"
	24.times { |i|
		hour_options[i+1] = "<option>" + (date + 60*60*(i + 1)).strftime("%p %I") + "</option>"
	}
	return date_options, hour_options
  end

  # Kindのセレクトボックスの中身を取得するメソッド
  def kind_array(user)
    if user.kind != nil
        options = user.kind.split(/;/)
		kind_text_array = Array.new(options.size)
		options.size.times { |i|
			kind_text_array[i] = options[i]
			options[i] =  "<option>" + options[i] + "</option>"
		}
		options.unshift('<option></option>')
		return options, kind_text_array
	end
	return "", ""
  end

  def create
    @todo = Todo.new()
	@todo.member_id = 0
    @todo.text = params[:todo_text]
    year  = params[:id][0, 4].to_i
    month = params[:id][4, 2].to_i
    day   = params[:id][6, 2].to_i

	# limit_datetime column
	@todo.limit_datetime = Time.mktime(year, month, day, 23, 59, 59)

	if @todo.save
    else
      flash[:notice] = 'Missed to registrate a todo'
    end
    render :partial => 'add_popup_todo'
  end

  
  def edit_kind
    if @current_user.kind != nil 
        @options = @current_user.kind.split(/;/)
		if @options.size == 0
			if params[:new_kind] != '' and params[:new_kind] != nil
				@current_user.kind = params[:new_kind] + ';'
			end
		else
		    i = 0
			@current_user.kind = ''
		    @options.each do |asdf|
		        if params[('kind' + i.to_s).intern] != '' and params[('kind' + i.to_s).intern] != nil
		            @current_user.kind = @current_user.kind + params[('kind' + i.to_s).intern] + ';'
		        end
		        i = i + 1
		    end
			if params[:new_kind] != '' and params[:new_kind] != nil
				@current_user.kind = @current_user.kind + params[:new_kind] + ';'
			end
		end    
		
	end    
    
    if @current_user.save
      flash[:notice] = 'Added kind'
    else
      flash[:notice] = 'Missed to registrate kind'
    end
	if flash[:action_name] == 'memo'
	    redirect_to :action => 'memo'
	else
	    redirect_to :action => 'top'
	end
  end
  
  # delete todo and memo
  def delete 
    @todo = Todo.find(params[:id])
    if @todo != nil
#        @deletedTodoTime = @todo.limit_datetime
        @todo.destroy
    end
    render :partial => 'delete'
  end


  # make a calendar array with todo for a month
  def month_of_calendar (year, month)
	first_day_of_this_month = Time.mktime(year, month, 1, 0, 0)
	first_day_of_first_week = first_day_of_this_month - first_day_of_this_month.wday * 86400
	last_day_of_this_month = Time.mktime(year, month + 1, 1, 0, 0) - 1
	last_day_of_last_week = last_day_of_this_month + (6 - last_day_of_this_month.wday) * 86400

	# Make calendar
	tmp_day = Time.mktime(first_day_of_first_week.year,
						first_day_of_first_week.month,
						first_day_of_first_week.day, 0, 0)
	tmp_calendar = Array.new()

	while tmp_day <= last_day_of_last_week
		tmp_calendar = tmp_calendar + [[Time.mktime(tmp_day.year, tmp_day.month, tmp_day.day, 0, 0),""]]
		tmp_day = tmp_day + 86400
	end
	
	# Get this month's todo	
    todo_list = Todo.find(:all,
		:conditions => [ "member_id = ? AND limit_datetime >= ? AND limit_datetime <= ? ", 
		@current_user.id, first_day_of_this_month, last_day_of_this_month],
		:order => 'limit_datetime')

	# Insert todos into calendar
	todo_list.each do |todo|
		tmp_index = first_day_of_this_month.wday + todo.limit_datetime.day - 1
#		if todo.text.length >= 12
# 字数制限をしない。<div><nobr>で制御しているので必要ない。
		if todo.text.length == -1
			tmp_calendar[tmp_index][1] = tmp_calendar[tmp_index][1] + "<br>" + todo.text[0,11] + "..."
		else
			tmp_calendar[tmp_index][1] = tmp_calendar[tmp_index][1] + "<br>" + todo.text
		end
	end

	return tmp_calendar
  end


  ###########################################################
  # ひと月分のカレンダーを取得するアクション（日付とTodo分離型）#
  ###########################################################
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
	    tmp_date = Array.new()
	    tmp_todo = Array.new()
        shukujitsu_index = Array.new()
        
	    while tmp_day <= last_day_of_last_week
		    tmp_date = tmp_date + [Time.mktime(tmp_day.year, tmp_day.month, tmp_day.day, 0, 0)]
	        if tmp_date[-1].shukujitu? != nil
		        shukujitsu_index << tmp_date.length - 1
            end
		    tmp_day = tmp_day + 86400
            tmp_todo = tmp_todo + [""]
	    end
	
	    # Get this month's todo	
        todo_list = Todo.find(:all,
		    :conditions => [ "member_id = ? AND limit_datetime >= ? AND limit_datetime <= ? ", 
#		    0, first_day_of_this_month, last_day_of_this_month],
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
    		    tmp_todo[date_index] = tmp_todo[date_index] + todo.text + "<br>"
	        end
        end

	    return tmp_todo, tmp_date, shukujitsu_index
    end
    


  ###########################################################
  # ひと月分のカレンダーを取得するアクション（日付とTodo一体型）#
  # おもにg_calendar アクションで使う                         #
  ###########################################################
    def fusionated_month_of_date_todo (year, month)
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
#		    0, first_day_of_this_month, last_day_of_this_month],
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



  def read_todo
	first_day_of_this_month = Time.mktime(Time.now.year, Time.now.month, params[:id], 0, 0) 
	last_day_of_this_month = Time.mktime(Time.now.year, Time.now.month, params[:id], 23, 59, 59)

	todo_list = Todo.find(:all,
		:conditions => [ "member_id = ? AND limit_datetime >= ? AND limit_datetime <= ? ", 
		@current_user.id, first_day_of_this_month, last_day_of_this_month],
		:order => 'limit_datetime')

	display_list = "<table>"
	todo_list.each do |todo|
		display_list = display_list + "<tr><td>" + todo.limit + "</td>"
		display_list = display_list + "<td>" + todo.text + "</td></tr>"
	end
	display_list = display_list +  "</table>"
	render :text => display_list

  end
  
  ###################################
  # ぐりぐりカレンダー用のアクション  #
  ###################################
  def g_calendar
    begin
        @today = Time.mktime(Time.now.year, Time.now.month, Time.now.day, 0, 0)
        months = Array.new()
        months = getMonths(@today)
        @todos = Array.new(9)
        @shukujitsu_indexes = Array.new(9)
    
        9.times{|i|
            @todos[i], @shukujitsu_indexes[i] = fusionated_month_of_date_todo(months[i].year, months[i].month)
        }
    rescue
        render :partial => 'calendar_table_error'
        return
    end    
  end

  # 今月と前後2ヶ月と、前後1年の日付を取ってくる
  def getMonths(today)
	months = Array.new()
	if today.month == 1
        months << Date.new(today.year - 2, 12, 1)
        months << Date.new(today.year - 1,  1, 1)
        months << Date.new(today.year - 1,  2, 1)
        months << Date.new(today.year - 1, 12, 1)
        months << Date.new(today.year    ,  1, 1)
        months << Date.new(today.year    ,  2, 1)
        months << Date.new(today.year    , 12, 1)
        months << Date.new(today.year + 1,  1, 1)
        months << Date.new(today.year + 1,  2, 1)
	elsif today.month == 12
        months << Date.new(today.year - 1, 11, 1)
        months << Date.new(today.year - 1, 12, 1)
        months << Date.new(today.year    ,  1, 1)
        months << Date.new(today.year    , 11, 1)
        months << Date.new(today.year    , 12, 1)
        months << Date.new(today.year + 1,  1, 1)
        months << Date.new(today.year + 1, 11, 1)
        months << Date.new(today.year + 1, 12, 1)
        months << Date.new(today.year + 2,  1, 1)
    else
        months << Date.new(today.year - 1, today.month - 1, 1)
        months << Date.new(today.year - 1, today.month    , 1)
        months << Date.new(today.year - 1, today.month + 1, 1)
        months << Date.new(today.year    , today.month - 1, 1)
        months << Date.new(today.year    , today.month    , 1)
        months << Date.new(today.year    , today.month + 1, 1)
        months << Date.new(today.year + 1, today.month - 1, 1)
        months << Date.new(today.year + 1, today.month    , 1)
        months << Date.new(today.year + 1, today.month + 1, 1)
    end
	return months
  end 
  

  # Ajax用の月を取ってくる
  def getAjaxMonths(today)
	months = Array.new()
    begin
        if today.month == 12
            months << Date.new(today.year    ,  1, 1)
            months << Date.new(today.year + 1,  1, 1)
            months << Date.new(today.year + 2,  1, 1)
        else
            months << Date.new(today.year - 1, today.month    , 1)
            months << Date.new(today.year    , today.month    , 1)
            months << Date.new(today.year + 1, today.month    , 1)
        end
    rescue
        render :partial => 'calendar_table_error'
        return
    end    

	return months
  end 
  
  ###############################
  # 以下、Ajax用のアクションたち  #
  ################################
  def addNewCalendar
    year  = params[:id][0, 4].to_i
    month = params[:id][4, params[:id].length - 4].to_i
    begin
        @nextDate = Time.mktime(year, month, 1, 0, 0)
        @todos, @dates,@shukujitsu_indexes = month_of_date_todo(year, month)
        
    rescue
        render :partial => 'calendar_table_error'
        return
    end    
    render :partial => 'calendar_table'
  end
  
  # 日表示のポップアップ内容を作成する
  def popupDayCalendar
    year  = params[:id][0, 4].to_i
    month = params[:id][4, 2].to_i
    day   = params[:id][6, 2].to_i
    @nextDays = Array.new()
    begin
        @nextDays << Time.mktime(year, month, day, 0, 0) - 604800
        @nextDays << Time.mktime(year, month, day, 0, 0) - 518400
        @nextDays << Time.mktime(year, month, day, 0, 0) - 432000
        @nextDays << Time.mktime(year, month, day, 0, 0) - 345600 
        @nextDays << Time.mktime(year, month, day, 0, 0) - 259200
        @nextDays << Time.mktime(year, month, day, 0, 0) - 172800
        @nextDays << Time.mktime(year, month, day, 0, 0) - 86400
        @nextDays << Time.mktime(year, month, day, 0, 0)
        @nextDays << Time.mktime(year, month, day, 0, 0) + 86400
        @nextDays << Time.mktime(year, month, day, 0, 0) + 172800
        @nextDays << Time.mktime(year, month, day, 0, 0) + 259200
        @nextDays << Time.mktime(year, month, day, 0, 0) + 345600 
        @nextDays << Time.mktime(year, month, day, 0, 0) + 432000
        @nextDays << Time.mktime(year, month, day, 0, 0) + 518400
        @nextDays << Time.mktime(year, month, day, 0, 0) + 604800
        @nextDays << Time.mktime(year, month, day, 0, 0) + 691200
        @nextDays << Time.mktime(year, month, day, 0, 0) + 691200 + 86400
    rescue
        render :partial => 'calendar_table_error'
        return
    end    
    
    @nextTodos = Array.new()
    15.times { |i|
	    @nextTodos << Todo.find(:all,
		    :conditions => [ "member_id = ? AND limit_datetime >= ? AND limit_datetime < ? ", 
		    0, @nextDays[i], @nextDays[i+1]],
		    :order => 'id')
    }
    render :partial => 'popup_day_calendar'
  end

  # Firefox用の日表示のポップアップ内容を追加する(未来方向)
  def addPopupDayNext()
    year  = params[:id][0, 4].to_i
    month = params[:id][4, 2].to_i
    day   = params[:id][6, 2].to_i
    begin
        @addNextDay = Time.mktime(year, month, day, 0, 0)
        tmpDay = Time.mktime(year, month, day, 0, 0) + 86400
    rescue
        render :partial => 'calendar_table_error'
        return
    end    
    @addNextTodo = Todo.find(:all,
	    :conditions => [ "member_id = ? AND limit_datetime >= ? AND limit_datetime < ? ", 
	    0, @addNextDay, tmpDay],
	    :order => 'id')
    render :partial => 'add_popup_day_next'
  end


  # Firefox用の日表示のポップアップ内容を追加する(過去方向)
  def addPopupDayBefore()
    year  = params[:id][0, 4].to_i
    month = params[:id][4, 2].to_i
    day   = params[:id][6, 2].to_i
    begin
        @addBeforeDay = Time.mktime(year, month, day, 0, 0)
        tmpDay = Time.mktime(year, month, day, 0, 0) + 86400
    rescue
        render :partial => 'calendar_table_error'
        return
    end    
    @addBeforeTodo = Todo.find(:all,
	    :conditions => [ "member_id = ? AND limit_datetime >= ? AND limit_datetime < ? ", 
	    0, @addBeforeDay, tmpDay],
	    :order => 'id')
    render :partial => 'add_popup_day_before'
  end
  
  # popupDaysでTodoを更新したときに動作するアクション
  def reload_todo()
    year  = params[:id][0, 4].to_i
    month = params[:id][4, 2].to_i
    day   = params[:id][6, 2].to_i
    begin
        @reloadedTodoTime = Time.mktime(year, month, day, 0, 0)
        tmpDay = Time.mktime(year, month, day, 0, 0) + 86400
    rescue
        render :partial => 'calendar_table_error'
        return
    end    
    @reloadedTodo = Todo.find(:all,
	    :conditions => [ "member_id = ? AND limit_datetime >= ? AND limit_datetime < ? ", 
	    0, @reloadedTodoTime, tmpDay],
	    :order => 'id')
    render :partial => 'reload_todo'
  end
end
