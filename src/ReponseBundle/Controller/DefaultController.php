<?php

namespace ReponseBundle\Controller;

use ReponseBundle\Entity\Reponse;
use ReponseBundle\Form\ReponseType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('ReponseBundle:Default:index.html.twig');
    }
    public function createAction(Request $request){
        $em = $this->getDoctrine()->getManager();
        $idRec = $request->get("idRec");
        $rec = $em->getRepository('ReclamationBundle:Reclamation')->findOneBy(array('id' => $idRec));
        $user = $em->getRepository('UserBundle:User')->findOneBy(array('id' => $this->getUser()->getId()));


        $con = $request->get("rep");
        $reponse = new Reponse();
        $reponse->setContenueReponse($con);
        $reponse->setIdUser($user);
        $reponse->setIdReclamation($rec);
        $reponse->setDateCreation(new \DateTime());
        $em->persist($reponse);
        $em->flush();

        return    $this->redirectToRoute("_ouvrir_reclamation",array('id'=>$idRec));

    }
}
