<?php

namespace ReclamationBundle\Controller;

use ReclamationBundle\Entity\Reclamation;
use ReclamationBundle\Form\ReclamationType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use UserBundle\Entity\User;

class DefaultController extends Controller
{


    public function listAction(){

        /*
        $user = $this->getUser();
        $userId = $user->getId();
        $em = $this->getDoctrine()->getManager();

        $listeReclamations = $em->getRepository('ReclamationBundle:Reclamation')->findBy(array(), array('id' => 'DESC'));


        return $this->render('@Reclamation/Default/index.html.twig', array(
            'listeReclamations' => $listeReclamations,
        ));
*/


        $em = $this->getDoctrine()->getManager();


        if ($this->isGranted('ROLE_ADMIN')) {


            $listeReclamations = $em->getRepository('ReclamationBundle:Reclamation')->findBy(array(), array('id' => 'DESC'));

        }
        else{
            $listeReclamations = $em->getRepository('ReclamationBundle:Reclamation')->findBy(array("id_user"=>$this->getUser()->getId()), array('id' => 'DESC'));

        }





        return $this->render('@Reclamation/Default/index.html.twig', array(
            'listeReclamations' => $listeReclamations,
        ));

    }


    public function createAction(Request $request){

        $user = $this->getUser();
        $userId = $user->getId();
        $reclmation = new Reclamation();

        $form = $this->createForm(ReclamationType::class, $reclmation);
        $form->handleRequest($request); /*creation d'une session pr stocker les valeurs de l'input*/
        if ($form->isSubmitted()) {
            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();
                $reclmation->setIdUser($user);
                $reclmation->setReadReclamation(false);
                $reclmation->setModifiedReclamation(false);
                $reclmation->setDateCreation(new \DateTime());
                $em->persist($reclmation);
                $em->flush();

                return $this->redirectToRoute("_list_reclamation");
            } else {
                $errors = $this->get('validator')->validate($reclmation);

                return $this->render('@Reclamation/Default/create.html.twig', array(
                    'errrs', $errors,
                    'form' => $form->createView()
                ));

            }


        }
        return $this->render('@Reclamation/Default/create.html.twig', array(
            'form' => $form->createView()
        ));


    }


    public function updateAction(Request $request,$id){

        $em = $this->getDoctrine()->getManager();
        $reclamation = $em->getRepository("ReclamationBundle:Reclamation")->find($id);
        $form = $this->createForm(Reclamation::class, $reclamation);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em->persist($reclamation);
            $em->flush();
            return $this->redirectToRoute('_list_reclamation');
        }


        return $this->render("ReclamationBundle:Default:index.html.twig", array(
            'form' => $form->createView()
        ));

    }


    public function removeAction(Request $request,$id){
        $em = $this->getDoctrine()->getManager();
        $reclamation = $em->getRepository("ReclamationBundle:Reclamation")->find($id);
        if ($reclamation != null) {
            $em->remove($reclamation);
            $em->flush();
        }

        return $this->redirectToRoute("_list_reclamation");


    }


public function ouvrirAction(Request $request,$id){
    $recId = $request->get("id");
    $em = $this->getDoctrine()->getManager();
    $reclamation = new Reclamation();
    $reclamationSelected = $em->getRepository("ReclamationBundle:Reclamation",$reclamation)->findOneBy(['id' => $recId]);







    return $this->render('@Reclamation/Default/reponse.html.twig', array(
        'reclamationSelected' => $reclamationSelected,
    ));

}

}
