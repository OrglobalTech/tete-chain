import { nfts } from "../../../data/nfts"

export default function handler(req, res){

  if (req.method === 'GET'){
    res.status(200).json(nfts)

}}