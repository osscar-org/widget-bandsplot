# Generated by Selenium IDE
import pytest
import time
import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

class test_widget():
  def setup_method(self, method):
    options = Options()
    cwd = os.getcwd()
    options.add_experimental_option("prefs", {"download.default_directory": cwd})
    self.driver = webdriver.Chrome(options=options)
    self.vars = {}

  def teardown_method(self, method):
    self.driver.quit()

  def download_widget_image(self):
    self.driver.get("http://localhost:8383/voila/render/example.ipynb")
    self.driver.set_window_size(1280, 2000)
    time.sleep(3)
    self.driver.save_screenshot("widget-01.png")

    self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(3)
    self.driver.save_screenshot("widget-02.png")

test = test_widget()
test.setup_method('Chrome')
test.download_widget_image()
test.teardown_method('Chrome')

