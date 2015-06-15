var imageHandler = function (sections) {
	var images = document.getElementsByTagName('img');
	EchoesWorks.forEach(images, function (image) {
		if (image !== undefined) {
			var imageSrc = image.src;
			var imageType = image.title;
			if (imageType === 'background') {
				image.parentNode.style.backgroundImage = "url('" + imageSrc + "')";
				image.parentNode.classList.add(imageType);
			} else if (imageType === 'left') {
				var block = document.createElement('div');
				var section = document.createElement('div');
				var node = image.parentNode;
				section.innerHTML = node.innerHTML;
				section.className = 'right';

				node.innerHTML = '';
				node.appendChild(block);
				node.appendChild(section);
				block.classList.add(imageType);
				block.style.background = "url('" + imageSrc + "') no-repeat center center";
			}
		}
	});
	imageHandler.removeImages();
	return sections;
};

imageHandler.removeImages = function () {
	var element = document.getElementsByTagName("img"), index;
	for (index = element.length - 1; index >= 0; index--) {
		element[index].parentNode.removeChild(element[index]);
	}
};

EchoesWorks.imageHandler = imageHandler;
