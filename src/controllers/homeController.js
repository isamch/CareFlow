
export const home = (req, res) => {
	return res.render('pages/index', { title: 'Home', message: 'Welcome to EJS Home' });
};

export const about = (req, res) => {
	return res.render('pages/about', { title: 'About', message: 'Welcome to EJS About' });
};
