<?php

namespace DemandeBundle\Controller;

use DemandeBundle\Entity\Demande;
use DemandeBundle\Form\DemandeType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{

    public function listAction()
    {
        $user   = $this->getUser();
        $userId = $user->getId();
        $em = $this->getDoctrine()->getManager();
       /* if ($this->isGranted('ROLE_ADMIN')) {
            $listDemandes = $em->getRepository('DemandeBundle:Demande')->findAll();
        } else {
            $listDemandes = $em->getRepository('DemandeBundle:Demande')->findBy(array('id_client'=>$userId));
        }
*/
        $listDemandes = $em->getRepository('DemandeBundle:Demande')->findAll();


        return $this->render('@Demande/Default/index.html.twig', array(
            'listDemandes' => $listDemandes,
        ));

    }

    public function createAction(Request $request){

        $user   = $this->getUser();
        $userId = $user->getId();
        $demande = new Demande();

        $form = $this->createForm(DemandeType::class, $demande);
        $form->handleRequest($request); /*creation d'une session pr stocker les valeurs de l'input*/
        if ($form->isSubmitted()) {
            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();
                $demande->setEtat(false);
                $demande->setIdClient($user);
                $em->persist($demande);
                $em->flush();

                return $this->redirectToRoute("_list_demande");
            }
            else{
                $errors = $this->get('validator')->validate($demande);

                return $this->render('@Demande/Default/create.html.twig', array(
                    'errrs',$errors,
                    'form' => $form->createView()
                ));

            }


        }
        return $this->render('@Demande/Default/create.html.twig', array(
            'form' => $form->createView()
        ));



    }

    public function removeAction(Request $request,$id){

        $em=$this->getDoctrine()->getManager();
        $demande=$em->getRepository("DemandeBundle:Demande")->find($id);
        if ($demande!=null){
            $em->remove($demande);
            $em->flush();
        }

        return $this->redirectToRoute("_list_demande");
    }
}
