class MichaelHintbubleGenerator < Rails::Generator::Base

  # This method copies stylesheet and javascript files to the 
  # corresponding public directories.
  #
  def manifest
    record do |m|
      m.file "michael_hintbuble_pointer.png", "public/images/michael_hintbuble_pointer.png"
      m.file "michael_hintbuble.css",         "public/stylesheets/michael_hintbuble.css"
      m.file "michael_hintbuble.js",          "public/javascripts/michael_hintbuble.js"
    end
  end
end