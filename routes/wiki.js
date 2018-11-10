const router = require('express').Router();
const { addPage, main, wikiPage } = require('../views');
const { Page, User } = require('../models');

module.exports = router;

router.get('/', async (req, res, next) => {
  try {
    const allPages = await Page.findAll();
    res.send(main(allPages));
  } catch (err) {
    next(err);
  }
});

router.get('/add', (req, res, next) => {
  res.send(addPage());
});

router.get('/:slug', async (req, res, next) => {
  try {
    const foundPage = await Page.findOne({
      where: { slug: req.params.slug },
    });
    if (!foundPage) {
      res.status(404).send('this page does not exist');
    }
    const author = await foundPage.getAuthor();
    res.send(wikiPage(foundPage, author));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const [user, wasCreated] = await User.findOrCreate({
      where: { name: req.body.name, email: req.body.email },
    });
    const page = await Page.create(req.body);
    page.setAuthor(user);
    res.redirect(`/wiki/${page.slug}`); // REVIEW THIS WHY !! ?
  } catch (error) {
    next(error);
  }
});
