class User < ActiveRecord::Base
    attr_accessor :password
    #attr_accessible :name, :email, :password, :password_confirmation
    attr_protected :password_digest

    validates :name, :presence => true
    validates :email, :presence => true, :uniqueness => true, :email => true
    validates :password, :presence => true, :confirmation => true
    validates :password_confirmation, :presence => { :if => :password }
    validates :phone, :format => { :allow_nil => true, :with => /^[()0-9- +.]{10,20}s*[extension.]{0,9}s*[0-9]{0,5}$/i }

    def password=(pass)
        return if pass.blank?
        @password = pass
        self.password_digest = BCrypt::Password.create(pass)
    end
end
