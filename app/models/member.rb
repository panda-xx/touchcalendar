class Member < ActiveRecord::Base
  attr_accessor :password, :password_confirmation
  attr_protected :hashed_password, :salt
  
  validates_confirmation_of :password, :message => "doesn't match with the password"
  
  # authentication. It returns Member object
  def self.authenticate(login_name, password)
    member = find_by_login_name(login_name)
    if member and member.hashed_password == hashed_password(password,member.salt)
      member
    else
      nil
    end
  end
  
  # generate a hash code
  def self.hashed_password(password, salt)
    Digest::SHA1.hexdigest(sprintf("%s%08d", password, salt))
  end
  
  # transaction when a password is sent
  def password=(pw)
    @password = pw
    if pw and pw.size > 0
      self.salt = rand(100000000)
      self.hashed_password = Member.hashed_password(pw, self.salt)
    end
  end
  
end
