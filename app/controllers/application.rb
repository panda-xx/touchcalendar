# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time
  
  private

  # See ActionController::RequestForgeryProtection for details
  # Uncomment the :secret if you're not using the cookie session store
  protect_from_forgery # :secret => '4f8c426c10e9f8301deefc9bcf49dd53'

  before_filter :resume_session
  
  def block_non_members
    unless @current_user
      flash[:warning] = 'Enter correct user name and password'
      redirect_to :controller => '/main', :action => 'top'
      return false
    end
  end

  private
  def resume_session
    return unless session[:member_id]
    
    begin
      @current_user = Member.find(session[:member_id])
    rescue ActiveRecord::RecordNotFound
      session[:member_id] = nil
    end
  end
    
#  protected
#  def rescue_action_in_public(exception)
#    status = response_code_for_rescue(exception)
#    flash[:notice] = interpret_status(status)

#    redirect_to :controller => "/calendar", :action => "g_calendar" 
#  end

end

