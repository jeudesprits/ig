import { Router } from 'express';
import { igFollowers } from '../actions';

const router = Router();

router.get('/', async (req, res, next) => {
  const { ig } = req.query;
  return res.json(await igFollowers.getListOfIGFollowersCounts(ig));
});

export default router;
