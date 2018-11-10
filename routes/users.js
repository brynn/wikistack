const router = require('express').Router();
const { userList, userPages } = require('../views');
const { Page, User } = require('../models');

module.exports = router;

router.get('/', async (req, res, next) => {
  try {
    const allUsers = await User.findAll();
    res.send(userList(allUsers));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id } });
    const uPages = await Page.findAll({
      where: {
        authorId: req.params.id,
      },
    });
    console.log(user);
    res.send(userPages(user, uPages));
  } catch (err) {
    next(err);
  }
});
