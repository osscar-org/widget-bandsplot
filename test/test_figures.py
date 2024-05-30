from PIL import Image, ImageChops, ImageStat

image1 = Image.open('widget-01.png')
image2 = Image.open('test/widget-sample.png')

diff = ImageChops.difference(image1, image2)
stat = ImageStat.Stat(diff)

if sum(stat.mean) == 0:
  print('images are the same')
else:
  raise Exception("The result is NOT the same as expected. Please check matplotlib version.")
