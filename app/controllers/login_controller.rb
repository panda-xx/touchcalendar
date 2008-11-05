class LoginController < ApplicationController
  verify :method      =>   :post,
          :only        => [ :login ],
          :redirect_to => { :controller =>  'main', :action => 'top'}
  # login action
  def login
    login_name = params[:login_name]
    password   = params[:password]
    member     = Member.authenticate(login_name, password)
    
    if member
      session[:member_id] = member.id
    else
      session[:member_id] = nil
      flash[:warning]     = 'Login Error'
      flash[:login_name]  = login_name
    end
    
    if params[:from]
      redirect_to :controller => 'member', :action => 'g_calendar'
    else
      redirect_to :controller => 'main', :action => 'top'
    end
  end
  
  #logout
  def logout
    session[:member_id] = nil
    redirect_to :controller => 'calendar', :action => 'g_calendar'
  end
end
