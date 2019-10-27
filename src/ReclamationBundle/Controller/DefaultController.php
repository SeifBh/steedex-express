<?php

namespace ReclamationBundle\Controller;

use ReclamationBundle\Entity\Reclamation;
use ReclamationBundle\Enum\ReclamationEtatEnum;
use ReclamationBundle\Form\ReclamationType;
use ReponseBundle\Entity\Reponse;
use ReponseBundle\Form\ReponseType;
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

        $roles = $this->getUser()->getRoles();
        $form = $this->createForm(ReclamationType::class, $reclmation, array('user' => $this->getUser()->getRoles()));



        $form->handleRequest($request); /*creation d'une session pr stocker les valeurs de l'input*/
        if ($form->isSubmitted()) {
            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();
                $reclmation->setIdUser($user);
                $reclmation->setEtat(ReclamationEtatEnum::ETAT_EnCours);
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
        $reclmation = new Reclamation();
        $reclamation = $em->getRepository("ReclamationBundle:Reclamation")->find($id);
        $roles = $this->getUser()->getRoles();
        $form = $this->createForm(ReclamationType::class, $reclamation, array('user' => $this->getUser()->getRoles()));

        $form->handleRequest($request);

        if ($form->isValid()) {
            $em->persist($reclamation);
            $em->flush();
            return $this->redirectToRoute('_list_reclamation');
        }


        return $this->render("ReclamationBundle:Default:update.html.twig", array(
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
    $reponse = new Reponse();
    $form=$this->createForm(ReponseType::class,$reponse);
    $form->handleRequest($request);

    if ($this->isGranted('ROLE_ADMIN')) {
        $reclamationSelected->setReadReclamation(true);
        $em->persist($reclamationSelected);
        $em->flush();
    }

    if ($this->isGranted('ROLE_SUPER_ADMIN')) {
        $reclamationSelected->setReadReclamation(true);
        $em->persist($reclamationSelected);
        $em->flush();

    }

        if ($form->isSubmitted())
    {

        $reponse->setDateCreation(new \DateTime());
        $em->persist($reponse);
        $em->flush();
    }





    $listeReponse = $em->getRepository('ReponseBundle:Reponse')->findBy(array('idReclamation'=>$reclamationSelected->getId()), array('id' => 'DESC'));

    return $this->render('@Reclamation/Default/reponse.html.twig', array(
        'reclamationSelected' => $reclamationSelected,
        'form'=>$form,
        'listeReponse'=>$listeReponse
    ));

}

    public function allReclamationAction()
    {
        $em=$this->getDoctrine()->getManager();
        $nb_rec = $em->getRepository("ReclamationBundle:Reclamation")->allRec();
        return new Response($nb_rec);
    }


}
